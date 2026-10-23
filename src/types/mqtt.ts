export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
export type LampState = 'ON' | 'OFF';
export type MessageDirection = 'sent' | 'received';
export type ThemeMode = 'light' | 'dark';

export interface SensorReading {
  value: number;
  updatedAt: number;
}

export interface LampReading {
  state: LampState;
  updatedAt: number;
}

export interface IncomingMessage {
  topic: string;
  payload: string;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  topic: string;
  payload: string;
  direction: MessageDirection;
  timestamp: number;
  valid: boolean;
}
