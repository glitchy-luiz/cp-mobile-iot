import Paho from 'paho-mqtt';
import { SUBSCRIBE_TOPICS } from '../config/topics';
import { ConnectionStatus, IncomingMessage } from '../types/mqtt';

/** O paho-mqtt expõe onConnected em runtime, mas @types/paho-mqtt não declara a propriedade. */
interface PahoClient extends Paho.Client {
  onConnected?: (reconnect: boolean, uri: string) => void;
}

type StatusListener = (status: ConnectionStatus, error: string | null) => void;
type MessageListener = (message: IncomingMessage) => void;

class MqttService {
  private client: PahoClient | null = null;
  private status: ConnectionStatus = 'disconnected';
  private error: string | null = null;
  private manualDisconnect = false;
  private statusListeners = new Set<StatusListener>();
  private messageListeners = new Set<MessageListener>();

  getStatus(): ConnectionStatus {
    return this.status;
  }

  /** Registra um listener de status. Retorna a função que remove o listener. */
  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status, this.error);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  private setStatus(status: ConnectionStatus, error: string | null = null): void {
    this.status = status;
    this.error = error;
    this.statusListeners.forEach((listener) => listener(status, error));
  }

  connect(url: string): void {
    this.dropClient();

    if (!/^wss?:\/\/.+/i.test(url.trim())) {
      this.setStatus('error', 'URL inválida. Use o formato wss://host:porta/caminho');
      return;
    }

    this.manualDisconnect = false;
    this.setStatus('connecting');

    const clientId = `iotcontrol_${Math.random().toString(16).slice(2, 10)}`;
    let client: PahoClient;
    try {
      client = new Paho.Client(url.trim(), clientId) as PahoClient;
    } catch (e) {
      this.setStatus('error', `Não foi possível criar o cliente MQTT: ${errorText(e)}`);
      return;
    }

    client.onConnectionLost = (response) => {
      if (this.client !== client) return;
      if (this.manualDisconnect || response.errorCode === 0) {
        this.setStatus('disconnected');
      } else {
        this.setStatus('error', `Conexão perdida: ${response.errorMessage}. Tentando reconectar...`);
      }
    };

    client.onMessageArrived = (message) => {
      if (this.client !== client) return;
      let payload: string;
      try {
        payload = message.payloadString;
      } catch {
        payload = '<payload ilegível>';
      }
      const incoming: IncomingMessage = {
        topic: message.destinationName,
        payload,
        timestamp: Date.now(),
      };
      this.messageListeners.forEach((listener) => listener(incoming));
    };

    client.onConnected = () => {
      if (this.client !== client) {
        safeDisconnect(client);
        return;
      }
      SUBSCRIBE_TOPICS.forEach((topic) => client.subscribe(topic, { qos: 0 }));
      this.setStatus('connected');
    };

    this.client = client;
    client.connect({
      timeout: 10,
      keepAliveInterval: 30,
      cleanSession: true,
      useSSL: url.trim().toLowerCase().startsWith('wss'),
      reconnect: true,
      onFailure: (err) => {
        if (this.client !== client) return;
        this.setStatus('error', `Falha ao conectar: ${err.errorMessage}`);
      },
    });
  }

  disconnect(): void {
    this.manualDisconnect = true;
    this.dropClient();
    this.setStatus('disconnected');
  }

  publish(topic: string, payload: string): void {
    if (!this.client || this.status !== 'connected' || !this.client.isConnected()) {
      throw new Error('Sem conexão com o broker. Conecte-se antes de enviar comandos.');
    }
    const message = new Paho.Message(payload);
    message.destinationName = topic;
    message.qos = 0;
    this.client.send(message);
  }

  private dropClient(): void {
    const client = this.client;
    this.client = null;
    if (client) safeDisconnect(client);
  }
}

function safeDisconnect(client: Paho.Client): void {
  try {
    client.disconnect();
  } catch {
    // cliente já desconectado ou ainda conectando
  }
}

function errorText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export const mqttService = new MqttService();
