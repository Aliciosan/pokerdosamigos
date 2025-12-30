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
  
  // Novo estado: Apenas o número de pessoas conectadas
  const [accessCount, setAccessCount] = useState(0);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<{id:number, message:string, type:'info'|'success'|'alert'}[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- 1. CARREGAMENTO E REALTIME ---
  useEffect(() => {
    // Carregar dados do Banco
    const fetchData = async () => {
      const { data: p } = await supabase.from('Player').select('*').order('startTime', { ascending: false });
      if(p) setPlayers(p);

      const { data: c } = await supabase.from('ConfirmedPlayer').select('*');
      if(c) setConfirmedPlayers(c);

      const { data: s } = await supabase.from('ScheduleItem').select('*');
      if(s) setSchedule(s);
    };

    fetchData();

    // Configurar Realtime (Banco de Dados + Presença Online)
    // Usamos um ID aleatório para rastrear este dispositivo
    const myPresenceId = 'user-' + Math.random().toString(36).substr(2, 9);

    const channel = supabase.channel('poker_room', {
      config: {
        presence: {
          key: myPresenceId,
        },
      },
    })
    // Rastreia Mudanças no Banco
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Player' }, (payload) => {
        if(payload.eventType === 'INSERT') {
           setPlayers(prev => [payload.new as Player, ...prev]);
           notify(`Novo jogador entrou!`, 'info');
        }
        if(payload.eventType === 'UPDATE') setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new as Player : p));
        if(payload.eventType === 'DELETE') setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ConfirmedPlayer' }, (payload) => {
        if(payload.eventType === 'INSERT') setConfirmedPlayers(prev => [...prev, payload.new as ConfirmedPlayer]);
        if(payload.eventType === 'UPDATE') setConfirmedPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new as ConfirmedPlayer : p));
        if(payload.eventType === 'DELETE') setConfirmedPlayers(prev => prev.filter(p => p.id !== payload.old.id));
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ScheduleItem' }, (payload) => {
        if(payload.eventType === 'INSERT') setSchedule(prev => [...prev, payload.new as ScheduleItem]);
        if(payload.eventType === 'DELETE') setSchedule(prev => prev.filter(s => s.id !== payload.old.id));
    })
    // Rastreia QUEM ESTÁ ONLINE (Presença)
    .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Conta quantas chaves únicas existem no canal
        const count = Object.keys(state).length;
        setAccessCount(count);
    })
    .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
            // Avisa o servidor que eu estou aqui
            await channel.track({ online_at: new Date().toISOString() });
        }
    });

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- 2. NOTIFICAÇÕES ---
  const notify = (message: string, type: 'info'|'success'|'alert' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [{ id, message, type, read: false, date: new Date().toISOString() }, ...prev]);
    setToasts(prev => [...prev, { id, message, type }]);
    playNotificationSound(soundEnabled);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  // --- 3. AÇÕES DO JOGO ---
  const addPlayer = async (name: string, buyIn: number, photo: string | null, isDealer: boolean) => {
    const uid = Date.now();
    if (isDealer) {
      const oldDealer = players.find(p => p.isDealer);
      if(oldDealer) await supabase.from('Player').update({ isDealer: false }).eq('id', oldDealer.id);
      const oldSeatDealer = confirmedPlayers.find(p => p.isDealer);
      if(oldSeatDealer) await supabase.from('ConfirmedPlayer').update({ isDealer: false }).eq('id', oldSeatDealer.id);
    }
    const newPlayer: Player = { id: uid, name, buyIn, rebuy: 0, cashOut: 0, startTime: new Date().toISOString(), status: 'playing', photo, isDealer };
    const { error } = await supabase.from('Player').insert(newPlayer);
    if(error) return notify('Erro ao adicionar jogador', 'alert');

    if (confirmedPlayers.length < 12) {
      let seat = 1;
      const taken = new Set(confirmedPlayers.map(p => p.seat));
      while (taken.has(seat)) seat++;
      if (seat <= 12) {
        const newSeat: ConfirmedPlayer = { id: uid, name, photo, seat, isDealer };
        await supabase.from('ConfirmedPlayer').insert(newSeat);
        notify(`${name} entrou na mesa!`, 'success');
      }
    }
  };

  const updateRebuy = async (id: number, amount: number) => {
    const player = players.find(p => p.id === id);
    if(player) {
        await supabase.from('Player').update({ rebuy: player.rebuy + amount }).eq('id', id);
        notify(`${player.name} fez Rebuy`, 'info');
    }
  };

  const checkoutPlayer = async (id: number, cashOut: number) => {
    await supabase.from('Player').update({ cashOut, status: 'finished', endTime: new Date().toISOString() }).eq('id', id);
    await supabase.from('ConfirmedPlayer').delete().eq('id', id);
  };

  const removeVisualSeat = async (id: number) => { await supabase.from('ConfirmedPlayer').delete().eq('id', id); };

  const updateSeatPosition = async (id: number, newSeat: number) => {
     const { data: occupied } = await supabase.from('ConfirmedPlayer').select('*').eq('seat', newSeat).single();
     if(occupied) return notify('Cadeira ocupada!', 'alert');
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
    if (!confirm("Encerrar sessão e limpar mesa?")) return;
    await supabase.from('Player').delete().neq('id', 0);
    await supabase.from('ConfirmedPlayer').delete().neq('id', 0);
    notify("Sessão finalizada!", 'success');
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