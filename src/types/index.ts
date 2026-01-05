export interface Player {
  id: number;
  name: string;
  buyIn: number;
  rebuy: number;
  cashOut: number;
  startTime: string;
  endTime?: string | null;
  status: 'playing' | 'finished';
  photo?: string | null;
  isDealer?: boolean;
}

export interface ConfirmedPlayer {
  id: number;
  name: string;
  photo?: string | null;
  seat: number;
  isDealer?: boolean;
}

export interface ScheduleItem {
  id: number;
  title: string;
  date: string;
}

export interface Session {
  id: number;
  date: string;
  summary: { totalIn: number; totalOut: number; balance: number; playerCount: number; };
}

export interface NotificationItem {
  id: number;
  message: string;
  type: 'info' | 'success' | 'alert';
  read: boolean;
  date: string;
}

export interface Visitor {
  id: number;
  name: string;
  since: string;
}