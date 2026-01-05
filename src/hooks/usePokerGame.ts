"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Player, ConfirmedPlayer, ScheduleItem, Session, NotificationItem } from '@/types';
import { playNotificationSound } from '@/utils/sound';

export function usePokerGame() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [confirmedPlayers, setConfirmedPlayers] = useState<ConfirmedPlayer[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [accessCount, setAccessCount] = useState(0);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<{id:number, message:string, type:'info'|'success'|'alert'}[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Função Central de Carregamento
  const fetchData = async () => {
    const { data: p } = await supabase.from('Player').select('*').order('startTime', { ascending: false }).limit(50);
    if(p) setPlayers(p);

    const { data: c } = await supabase.from('ConfirmedPlayer').select('*');
    if(c) setConfirmedPlayers(c);

    const { data: s } = await supabase.from('ScheduleItem').select('*');
    if(s) setSchedule(s);
  };

  // --- REALTIME BLINDADO ---
  useEffect(() => {
    fetchData(); // Carrega ao abrir

    const myPresenceId = 'user-' + Math.random().toString(36).substr(2, 9);
    
    const channel = supabase.channel('poker_room', {
      config: { presence: { key: myPresenceId } },
    });

    channel
      // A MÁGICA: Em qualquer mudança (INSERT, UPDATE, DELETE), recarrega tudo.
      // Isso evita bugs visuais e garante que todos vejam a mesma coisa.
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Player' }, () => {
          console.log("Alteração em Player!");
          fetchData();
          notify("Mesa atualizada!", "info");
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ConfirmedPlayer' }, () => {
          fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ScheduleItem' }, () => {
          fetchData();
      })
      .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          setAccessCount(Object.keys(state).length);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- AUXILIARES ---
  const notify = (message: string, type: 'info'|'success'|'alert' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [{ id, message, type, read: false, date: new Date().toISOString() }, ...prev]);
    setToasts(prev => [...prev, { id, message, type }]);
    if (type !== 'info') playNotificationSound(soundEnabled);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  // --- AÇÕES (Envia para o banco e deixa o Realtime atualizar a tela) ---
  const addPlayer = async (name: string, buyIn: number, photo: string | null, isDealer: boolean) => {
    const uid = Date.now();
    if (isDealer) {
      // Remove dealer anterior (SQL seria melhor, mas fazendo via JS por enquanto)
      const oldDealer = players.find(p => p.isDealer);
      if(oldDealer) await supabase.from('Player').update({ isDealer: false }).eq('id', oldDealer.id);
      const oldSeatDealer = confirmedPlayers.find(p => p.isDealer);
      if(oldSeatDealer) await supabase.from('ConfirmedPlayer').update({ isDealer: false }).eq('id', oldSeatDealer.id);
    }

    const newPlayer: Player = { id: uid, name, buyIn, rebuy: 0, cashOut: 0, startTime: new Date().toISOString(), status: 'playing', photo, isDealer };
    const { error } = await supabase.from('Player').insert(newPlayer);
    
    if(error) return notify('Erro ao salvar.', 'alert');

    // Tenta sentar automaticamente
    if (confirmedPlayers.length < 12) {
      let seat = 1;
      const taken = new Set(confirmedPlayers.map(p => p.seat));
      while (taken.has(seat)) seat++;
      if (seat <= 12) {
        await supabase.from('ConfirmedPlayer').insert({ id: uid, name, photo, seat, isDealer });
      }
    }
  };

  const updateRebuy = async (id: number, amount: number) => {
    const player = players.find(p => p.id === id);
    if(player) await supabase.from('Player').update({ rebuy: player.rebuy + amount }).eq('id', id);
  };
  const checkoutPlayer = async (id: number, cashOut: number) => {
    await supabase.from('Player').update({ cashOut, status: 'finished', endTime: new Date().toISOString() }).eq('id', id);
    await supabase.from('ConfirmedPlayer').delete().eq('id', id);
  };
  const removeVisualSeat = async (id: number) => { await supabase.from('ConfirmedPlayer').delete().eq('id', id); };
  const updateSeatPosition = async (id: number, newSeat: number) => {
     const { data: occupied } = await supabase.from('ConfirmedPlayer').select('*').eq('seat', newSeat).single();
     if(occupied) return notify('Lugar ocupado.', 'alert');
     await supabase.from('ConfirmedPlayer').update({ seat: newSeat }).eq('id', id);
  };
  const swapSeats = async (id1: number, id2: number) => {
      const p1 = confirmedPlayers.find(p => p.id === id1);
      const p2 = confirmedPlayers.find(p => p.id === id2);
      if(p1 && p2) {
          await supabase.from('ConfirmedPlayer').update({ seat: p2.seat }).eq('id', id1);
          await supabase.from('ConfirmedPlayer').update({ seat: p1.seat }).eq('id', id2);
      }
  };
  const finishSession = async () => {
    if (!confirm("Encerrar sessão?")) return;
    await supabase.from('Player').delete().neq('id', 0);
    await supabase.from('ConfirmedPlayer').delete().neq('id', 0);
    notify("Sessão limpa!", 'success');
  };
  const deleteHistoryItem = async (id: number) => { await supabase.from('Player').delete().eq('id', id); };
  const clearHistory = async () => {
      const idsToDelete = players.filter(p => p.status === 'finished').map(p => p.id);
      if(idsToDelete.length > 0) await supabase.from('Player').delete().in('id', idsToDelete);
  };
  const addSchedule = async (title: string, date: string) => { await supabase.from('ScheduleItem').insert({ id: Date.now(), title, date }); };
  const deleteSchedule = async (id: number) => { await supabase.from('ScheduleItem').delete().eq('id', id); };
  const clearSessions = () => setSessions([]);

  return { 
    players, confirmedPlayers, schedule, sessions, notifications, toasts, soundEnabled, accessCount,
    addPlayer, updateRebuy, checkoutPlayer, finishSession, addSchedule, deleteSchedule, clearSessions, 
    removeToast, setSoundEnabled, markAllRead, clearNotifications,
    removeVisualSeat, updateSeatPosition, swapSeats, deleteHistoryItem, clearHistory
  };
}