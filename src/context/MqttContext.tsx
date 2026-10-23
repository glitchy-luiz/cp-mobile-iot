import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import {
  COMMAND_CONFIRM_TIMEOUT_MS,
  DEFAULT_BROKER_URL,
  HISTORY_LIMIT,
  TOPICS,
} from '../config/topics';
import { mqttService } from '../services/mqttService';
import { loadBrokerUrl, saveBrokerUrl } from '../services/storageService';
import {
  ConnectionStatus,
  HistoryItem,
  IncomingMessage,
  LampReading,
  LampState,
  MessageDirection,
  SensorReading,
} from '../types/mqtt';
import { parseLampState, parseSensorValue } from '../utils/parsers';

interface MqttContextValue {
  status: ConnectionStatus;
  error: string | null;
  temperature: SensorReading | null;
  humidity: SensorReading | null;
  lamp: LampReading | null;
  /** Comando enviado e ainda sem confirmação de estado. */
  pendingCommand: LampState | null;
  notice: string | null;
  history: HistoryItem[];
  brokerUrl: string;
  ready: boolean;
  setBrokerUrl: (url: string) => void;
  connect: (url?: string) => void;
  disconnect: () => void;
  sendLampCommand: (action: LampState) => boolean;
  clearNotice: () => void;
}

const MqttContext = createContext<MqttContextValue | undefined>(undefined);

export function MqttProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>(mqttService.getStatus());
  const [error, setError] = useState<string | null>(null);
  const [temperature, setTemperature] = useState<SensorReading | null>(null);
  const [humidity, setHumidity] = useState<SensorReading | null>(null);
  const [lamp, setLamp] = useState<LampReading | null>(null);
  const [pendingCommand, setPendingCommand] = useState<LampState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [brokerUrl, setBrokerUrlState] = useState<string>(DEFAULT_BROKER_URL);
  const [ready, setReady] = useState(false);

  const idCounter = useRef(0);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addHistory = useCallback(
    (topic: string, payload: string, direction: MessageDirection, timestamp: number, valid: boolean) => {
      idCounter.current += 1;
      const item: HistoryItem = {
        id: `${timestamp}-${idCounter.current}`,
        topic,
        payload,
        direction,
        timestamp,
        valid,
      };
      setHistory((prev) => [item, ...prev].slice(0, HISTORY_LIMIT));
    },
    [],
  );

  const clearPendingTimer = useCallback(() => {
    if (pendingTimer.current) {
      clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const offStatus = mqttService.onStatus((nextStatus, nextError) => {
      setStatus(nextStatus);
      setError(nextError);
    });

    const offMessage = mqttService.onMessage((message: IncomingMessage) => {
      const { topic, payload, timestamp } = message;
      let valid = true;

      if (topic === TOPICS.temperature) {
        const value = parseSensorValue(payload);
        if (value === null) valid = false;
        else setTemperature({ value, updatedAt: timestamp });
      } else if (topic === TOPICS.humidity) {
        const value = parseSensorValue(payload);
        if (value === null) valid = false;
        else setHumidity({ value, updatedAt: timestamp });
      } else if (topic === TOPICS.lampState) {
        const state = parseLampState(payload);
        if (state === null) {
          valid = false;
        } else {
          setLamp({ state, updatedAt: timestamp });
          clearPendingTimer();
          setPendingCommand(null);
          setNotice(null);
        }
      }

      addHistory(topic, payload, 'received', timestamp, valid);
    });

    return () => {
      offStatus();
      offMessage();
      clearPendingTimer();
    };
  }, [addHistory, clearPendingTimer]);

  useEffect(() => {
    let active = true;
    loadBrokerUrl().then((saved) => {
      if (!active) return;
      const url = saved ?? DEFAULT_BROKER_URL;
      setBrokerUrlState(url);
      setReady(true);
      mqttService.connect(url);
    });
    return () => {
      active = false;
      mqttService.disconnect();
    };
  }, []);

  const setBrokerUrl = useCallback((url: string) => {
    setBrokerUrlState(url);
    saveBrokerUrl(url);
  }, []);

  const connect = useCallback(
    (url?: string) => {
      const target = (url ?? brokerUrl).trim();
      setBrokerUrl(target);
      setNotice(null);
      mqttService.connect(target);
    },
    [brokerUrl, setBrokerUrl],
  );

  const disconnect = useCallback(() => {
    clearPendingTimer();
    setPendingCommand(null);
    mqttService.disconnect();
  }, [clearPendingTimer]);

  const sendLampCommand = useCallback(
    (action: LampState): boolean => {
      const payload = JSON.stringify({ action });
      try {
        mqttService.publish(TOPICS.lampCommand, payload);
      } catch (e) {
        setNotice(e instanceof Error ? e.message : 'Não foi possível enviar o comando.');
        return false;
      }
      addHistory(TOPICS.lampCommand, payload, 'sent', Date.now(), true);
      setNotice(null);
      setPendingCommand(action);
      clearPendingTimer();
      pendingTimer.current = setTimeout(() => {
        setPendingCommand(null);
        setNotice('O dispositivo não confirmou o comando. Verifique se o simulador está em execução.');
      }, COMMAND_CONFIRM_TIMEOUT_MS);
      return true;
    },
    [addHistory, clearPendingTimer],
  );

  const clearNotice = useCallback(() => setNotice(null), []);

  return (
    <MqttContext.Provider
      value={{
        status,
        error,
        temperature,
        humidity,
        lamp,
        pendingCommand,
        notice,
        history,
        brokerUrl,
        ready,
        setBrokerUrl,
        connect,
        disconnect,
        sendLampCommand,
        clearNotice,
      }}
    >
      {children}
    </MqttContext.Provider>
  );
}

export function useMqtt(): MqttContextValue {
  const ctx = useContext(MqttContext);
  if (!ctx) throw new Error('useMqtt deve ser usado dentro de MqttProvider');
  return ctx;
}
