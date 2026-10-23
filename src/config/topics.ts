export const TOPIC_PREFIX = 'fiap/2ESPV/grupoBGLLM';

export const TOPICS = {
  temperature: `${TOPIC_PREFIX}/sensor/temperatura`,
  humidity: `${TOPIC_PREFIX}/sensor/umidade`,
  lampCommand: `${TOPIC_PREFIX}/lampada/comando`,
  lampState: `${TOPIC_PREFIX}/lampada/estado`,
} as const;

export const SUBSCRIBE_TOPICS: string[] = [TOPICS.temperature, TOPICS.humidity, TOPICS.lampState];

export const DEFAULT_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';

export const HISTORY_LIMIT = 10;
export const COMMAND_CONFIRM_TIMEOUT_MS = 5000;
