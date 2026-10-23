const mqtt = require('mqtt');

const BROKER_URL = process.env.BROKER_URL || 'wss://broker.hivemq.com:8884/mqtt';
const PREFIX = process.env.TOPIC_PREFIX || 'fiap/2ESPV/grupoBGLLM';

const TOPIC_TEMPERATURE = `${PREFIX}/sensor/temperatura`;
const TOPIC_HUMIDITY = `${PREFIX}/sensor/umidade`;
const TOPIC_LAMP_COMMAND = `${PREFIX}/lampada/comando`;
const TOPIC_LAMP_STATE = `${PREFIX}/lampada/estado`;

let temperature = 24.5;
let humidity = 58;
let lampState = 'OFF';

const log = (msg) => console.log(`[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`);
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const client = mqtt.connect(BROKER_URL, {
  clientId: `iotcontrol_sim_${Math.random().toString(16).slice(2, 10)}`,
  reconnectPeriod: 3000,
});

function publishLampState() {
  client.publish(TOPIC_LAMP_STATE, JSON.stringify({ state: lampState }), { retain: true });
  log(`PUB ${TOPIC_LAMP_STATE} -> {"state":"${lampState}"}`);
}

function publishSensors() {
  temperature = clamp(temperature + (Math.random() - 0.5), 18, 32);
  humidity = clamp(humidity + Math.round((Math.random() - 0.5) * 4), 30, 80);
  const t = Number(temperature.toFixed(1));
  client.publish(TOPIC_TEMPERATURE, JSON.stringify({ value: t }));
  client.publish(TOPIC_HUMIDITY, JSON.stringify({ value: humidity }));
  log(`PUB temperatura=${t} umidade=${humidity}`);
}

let timer = null;

client.on('connect', () => {
  log(`Conectado a ${BROKER_URL} (prefixo ${PREFIX})`);
  client.subscribe(TOPIC_LAMP_COMMAND, (err) => {
    if (err) log(`Erro ao assinar comando: ${err.message}`);
  });
  publishLampState();
  publishSensors();
  if (timer) clearInterval(timer);
  timer = setInterval(publishSensors, 3000);
});

client.on('message', (topic, buffer) => {
  if (topic !== TOPIC_LAMP_COMMAND) return;
  const raw = buffer.toString();
  log(`SUB ${topic} <- ${raw}`);
  try {
    const { action } = JSON.parse(raw);
    if (action !== 'ON' && action !== 'OFF') throw new Error('action deve ser ON ou OFF');
    lampState = action;
    publishLampState();
  } catch (e) {
    log(`Comando inválido ignorado: ${e.message}`);
  }
});

client.on('reconnect', () => log('Reconectando...'));
client.on('error', (err) => log(`Erro: ${err.message}`));
client.on('close', () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

process.on('SIGINT', () => {
  log('Encerrando simulador.');
  client.end(true, () => process.exit(0));
});
