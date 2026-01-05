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

  // --- CARREGAMENTO DE DADOS ---
  const fetchData = async () => {
    const { data: p } = await supabase.from('Player').select('*').order('startTime', { ascending: false }).limit(50);
    if(p) setPlayers(p);

    const { data: c } = await supabase.from('ConfirmedPlayer').select('*');
    if(c) setConfirmedPlayers(c);

    const { data: s } = await supabase.from('ScheduleItem').select('*');
    if(s) setSchedule(s);
  };

  // --- NOTIFICAÇÕES COMPLETAS (REALTIME) ---
  useEffect(() => {
    fetchData();

    const myPresenceId = 'user-' + Math.random().toString(36).substr(2, 9);
    
    const channel = supabase.channel('poker_room', {
      config: { presence: { key: myPresenceId } },
    });

    channel
      // 1. MONITORAMENTO DE JOGADORES (Histórico e Status)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Player' }, (payload) => {
          fetchData(); // Sempre atualiza os dados visuais
          
          if (payload.eventType === 'INSERT') {
              const p = payload.new as Player;
              notify(`Novo Jogador: ${p.name} entrou com R$ ${p.buyIn}.`, 'success');
          }
          if (payload.eventType === 'UPDATE') {
              const novo = payload.new as Player;
              // Detecta Checkout (Status mudou para finished)
              if (novo.status === 'finished') {
                  notify(`${novo.name} encerrou (Checkout: R$ ${novo.cashOut}).`, 'alert');
              }
              // Detecta Rebuy (Valor aumentou)
              else if (novo.rebuy > 0) {
                  notify(`${novo.name} fez um Rebuy/Add-on.`, 'info');
              }
              // Detecta Edição Genérica
              else {
                  notify(`Dados de ${novo.name} atualizados.`, 'info');
              }
          }
          if (payload.eventType === 'DELETE') {
             notify('Um registro foi apagado do histórico.', 'alert');
          }
      })

      // 2. MONITORAMENTO DA MESA VISUAL (Lugares)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ConfirmedPlayer' }, (payload) => {
          fetchData();
          
          if (payload.eventType === 'INSERT') {
             const p = payload.new as ConfirmedPlayer;
             notify(`${p.name} sentou na cadeira ${p.seat}.`, 'success');
          }
          if (payload.eventType === 'UPDATE') {
             // Geralmente é troca de lugar
             const p = payload.new as ConfirmedPlayer;
             notify(`${p.name} mudou de lugar (Cadeira ${p.seat}).`, 'info');
          }
          if (payload.eventType === 'DELETE') {
             // Alguém levantou ou fez checkout
             notify('Lugar liberado na mesa.', 'info');
          }
      })

      // 3. MONITORAMENTO DE AGENDAMENTO
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ScheduleItem' }, (payload) => {
          fetchData();
          if(payload.eventType === 'INSERT') notify("Novo jogo agendado!", 'success');
          if(payload.eventType === 'DELETE') notify("Agendamento cancelado.", 'alert');
      })

      // 4. PRESENÇA
      .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const count = Object.keys(state).length;
          setAccessCount(count);
          // Opcional: Notificar entrada de visitante (pode ser muito spam, deixei comentado)
          // notify(`Visitante conectado. Total: ${count}`, 'info');
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- SISTEMA DE NOTIFICAÇÃO ---
  const notify = (message: string, type: 'info'|'success'|'alert' = 'info') => {
    const id = Date.now() + Math.random();
    // Adiciona na lista do "Sininho"
    setNotifications(prev => [{ id, message, type, read: false, date: new Date().toISOString() }, ...prev]);
    // Adiciona no Toast flutuante
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Toca som (menos para mensagens neutras demais se preferir)
    if(soundEnabled) playNotificationSound(soundEnabled);
  };

  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  // --- AÇÕES DO USUÁRIO (Disparam gatilhos no banco) ---
  const addPlayer = async (name: string, buyIn: number, photo: string | null, isDealer: boolean) => {
    const uid = Date.now();
    // Lógica Dealer
    if (isDealer) {
      const oldDealer = players.find(p => p.isDealer);
      if(oldDealer) await supabase.from('Player').update({ isDealer: false }).eq('id', oldDealer.id);
      const oldSeatDealer = confirmedPlayers.find(p => p.isDealer);
      if(oldSeatDealer) await supabase.from('ConfirmedPlayer').update({ isDealer: false }).eq('id', oldSeatDealer.id);
    }

    const newPlayer: Player = { id: uid, name, buyIn, rebuy: 0, cashOut: 0, startTime: new Date().toISOString(), status: 'playing', photo, isDealer };
    const { error } = await supabase.from('Player').insert(newPlayer);
    
    if(error) return notify('Erro ao salvar jogador.', 'alert');

    // Tenta sentar automaticamente na mesa visual
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
    // Atualiza status para finished E remove da mesa visual
    await supabase.from('Player').update({ cashOut, status: 'finished', endTime: new Date().toISOString() }).eq('id', id);
    await supabase.from('ConfirmedPlayer').delete().eq('id', id);
  };

  const removeVisualSeat = async (id: number) => { 
      await supabase.from('ConfirmedPlayer').delete().eq('id', id); 
  };

  const updateSeatPosition = async (id: number, newSeat: number) => {
     const { data: occupied } = await supabase.from('ConfirmedPlayer').select('*').eq('seat', newSeat).single();
     if(occupied) return notify('Essa cadeira já está ocupada!', 'alert');
     await supabase.from('ConfirmedPlayer').update({ seat: newSeat }).eq('id', id);
  };

  const swapSeats = async (id1: number, id2: number) => {
      const p1 = confirmedPlayers.find(p => p.id === id1);
      const p2 = confirmedPlayers.find(p => p.id === id2);
      if(p1 && p2) {
          // Troca atômica (idealmente) ou sequencial
          await supabase.from('ConfirmedPlayer').update({ seat: p2.seat }).eq('id', id1);
          await supabase.from('ConfirmedPlayer').update({ seat: p1.seat }).eq('id', id2);
          notify("Troca de lugares realizada.", 'success');
      }
  };

  const finishSession = async () => {
    if (!confirm("Tem certeza que deseja encerrar a sessão?")) return;
    notify("Encerrando sessão...", 'info');
    await supabase.from('Player').delete().neq('id', 0);
    await supabase.from('ConfirmedPlayer').delete().neq('id', 0);
    notify("Sessão finalizada e limpa!", 'success');
  };

  const deleteHistoryItem = async (id: number) => { 
      await supabase.from('Player').delete().eq('id', id); 
  };

  const clearHistory = async () => {
      const idsToDelete = players.filter(p => p.status === 'finished').map(p => p.id);
      if(idsToDelete.length > 0) {
          await supabase.from('Player').delete().in('id', idsToDelete);
          notify("Histórico limpo.", 'success');
      }
  };

  const addSchedule = async (title: string, date: string) => { 
      await supabase.from('ScheduleItem').insert({ id: Date.now(), title, date }); 
  };

  const deleteSchedule = async (id: number) => { 
      await supabase.from('ScheduleItem').delete().eq('id', id); 
  };

  const clearSessions = () => setSessions([]);

  return { 
    players, confirmedPlayers, schedule, sessions, notifications, toasts, soundEnabled, accessCount,
    addPlayer, updateRebuy, checkoutPlayer, finishSession, addSchedule, deleteSchedule, clearSessions, 
    removeToast, setSoundEnabled, markAllRead, clearNotifications,
    removeVisualSeat, updateSeatPosition, swapSeats, deleteHistoryItem, clearHistory
  };
}