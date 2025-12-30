"use client";
import { useState, useEffect } from 'react';
import { Player, ConfirmedPlayer, ScheduleItem, Session, NotificationItem } from '@/types';
import { playNotificationSound } from '@/utils/sound';

export function usePokerGame() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [confirmedPlayers, setConfirmedPlayers] = useState<ConfirmedPlayer[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Novos Estados para Notificação e Som
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<{id:number, message:string, type:'info'|'success'|'alert'}[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Carregar dados
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPlayers(JSON.parse(localStorage.getItem('pokerData_v33') || '[]'));
      setConfirmedPlayers(JSON.parse(localStorage.getItem('pokerConfirmed_v33') || '[]'));
      setSchedule(JSON.parse(localStorage.getItem('pokerSchedule_v33') || '[]'));
      setSessions(JSON.parse(localStorage.getItem('pokerSessions_v33') || '[]'));
      setNotifications(JSON.parse(localStorage.getItem('pokerNotifs_v33') || '[]'));
      
      const savedSound = localStorage.getItem('pokerSound_v33');
      if (savedSound !== null) setSoundEnabled(JSON.parse(savedSound));
    }
  }, []);

  // Salvar dados
  useEffect(() => { if(typeof window !== 'undefined') localStorage.setItem('pokerData_v33', JSON.stringify(players)); }, [players]);
  useEffect(() => { if(typeof window !== 'undefined') localStorage.setItem('pokerConfirmed_v33', JSON.stringify(confirmedPlayers)); }, [confirmedPlayers]);
  useEffect(() => { if(typeof window !== 'undefined') localStorage.setItem('pokerSchedule_v33', JSON.stringify(schedule)); }, [schedule]);
  useEffect(() => { if(typeof window !== 'undefined') localStorage.setItem('pokerSessions_v33', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { if(typeof window !== 'undefined') localStorage.setItem('pokerNotifs_v33', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { if(typeof window !== 'undefined') localStorage.setItem('pokerSound_v33', JSON.stringify(soundEnabled)); }, [soundEnabled]);

  // --- SISTEMA DE NOTIFICAÇÃO ---
  const notify = (message: string, type: 'info'|'success'|'alert' = 'info') => {
    const id = Date.now();
    // Adiciona ao histórico
    setNotifications(prev => [{ id, message, type, read: false, date: new Date().toISOString() }, ...prev]);
    // Adiciona ao Toast (popup)
    setToasts(prev => [...prev, { id, message, type }]);
    // Toca som
    playNotificationSound(soundEnabled);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => setNotifications([]);

  // --- AÇÕES DO JOGO ---

  const addPlayer = (name: string, buyIn: number, photo: string | null, isDealer: boolean) => {
    const uid = Date.now();
    if (isDealer) {
      setPlayers(p => p.map(x => ({ ...x, isDealer: false })));
      setConfirmedPlayers(p => p.map(x => ({ ...x, isDealer: false })));
    }
    const newPlayer: Player = { id: uid, name, buyIn, rebuy: 0, cashOut: 0, startTime: new Date().toISOString(), status: 'playing', photo, isDealer };
    setPlayers(prev => [newPlayer, ...prev]);

    // Auto sentar
    if (confirmedPlayers.length < 12) {
      let seat = 1;
      const taken = new Set(confirmedPlayers.map(p => p.seat));
      while (taken.has(seat)) seat++;
      if (seat <= 12) {
        setConfirmedPlayers(prev => [...prev, { id: uid, name, photo, seat, isDealer }]);
        notify(`${name} entrou na mesa (Cadeira ${seat})`, 'success');
      } else {
        notify(`${name} entrou (Sem cadeira livre)`, 'info');
      }
    } else {
        notify(`${name} entrou (Mesa cheia)`, 'alert');
    }
  };

  const updateRebuy = (id: number, amount: number) => {
    setPlayers(prev => prev.map(p => {
        if(p.id === id) {
            notify(`${p.name} fez rebuy de R$ ${amount}`, 'info');
            return { ...p, rebuy: p.rebuy + amount };
        }
        return p;
    }));
  };

  const checkoutPlayer = (id: number, cashOut: number) => {
    setPlayers(prev => prev.map(p => {
        if(p.id === id) {
            notify(`${p.name} saiu (Cashout: R$ ${cashOut})`, 'info');
            return { ...p, cashOut, status: 'finished', endTime: new Date().toISOString() };
        }
        return p;
    }));
    setConfirmedPlayers(prev => prev.filter(p => p.id !== id));
  };

  const finishSession = () => {
    if (players.length === 0) return alert("Nada para salvar.");
    if (!confirm("Encerrar sessão?")) return;
    
    const totalIn = players.reduce((acc, p) => acc + p.buyIn + p.rebuy, 0);
    const totalOut = players.reduce((acc, p) => acc + (p.cashOut || 0), 0);
    const newSession: Session = {
      id: Date.now(), date: new Date().toISOString(),
      summary: { totalIn, totalOut, balance: totalIn - totalOut, playerCount: players.length }
    };
    setSessions(prev => [newSession, ...prev]);
    setPlayers([]);
    setConfirmedPlayers([]);
    
    const now = new Date().getTime();
    setSchedule(prev => prev.filter(s => Math.abs(now - new Date(s.date).getTime()) > 86400000));
    notify("Sessão salva e finalizada!", 'success');
  };

  const addSchedule = (title: string, date: string) => {
      setSchedule(prev => [...prev, { id: Date.now(), title, date }]);
      notify(`Agendado: ${title}`, 'success');
  };
  
  const deleteSchedule = (id: number) => setSchedule(prev => prev.filter(s => s.id !== id));
  const clearSessions = () => setSessions([]);

  return { 
    players, confirmedPlayers, schedule, sessions, 
    notifications, toasts, soundEnabled,
    addPlayer, updateRebuy, checkoutPlayer, finishSession, addSchedule, deleteSchedule, clearSessions, 
    setPlayers, setConfirmedPlayers, removeToast, setSoundEnabled, markAllRead, clearNotifications
  };
}