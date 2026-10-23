# IoT Control — MQTT em React Native

Painel mobile (React Native + Expo + TypeScript) que se comunica com um dispositivo IoT **simulado** via **MQTT sobre WebSocket**. Mostra temperatura e umidade em tempo real, controla uma lâmpada virtual, guarda as 10 últimas mensagens e persiste preferências com AsyncStorage.

## Integrantes

| Nome completo | RM |
|---|---|
| _PREENCHER — Nome completo do integrante 1_ | _RM_ |
| _PREENCHER — Nome completo do integrante 2_ | _RM_ |
| _PREENCHER — Nome completo do integrante 3_ | _RM_ |

> ⚠️ Preencha **nome completo e RM de todos** antes de entregar. Sem isso, a nota é zero.

## Tecnologias e versões

| Tecnologia | Versão |
|---|---|
| Expo | ~58.0 |
| React Native | 0.88 |
| React | 19.3 |
| TypeScript | ~6.0 |
| React Navigation (native + bottom-tabs) | 7.x |
| paho-mqtt (cliente MQTT sobre WebSocket) | 1.1 |
| @react-native-async-storage/async-storage | 2.2 |
| Simulador: Node.js + mqtt.js | Node 18+ / mqtt 5 |

(Confira os valores finais no seu `package.json`.)

## Instalação e execução

```bash
npm install
npx expo start
```

Abra no Expo Go (Android/iOS) lendo o QR Code, ou pressione `a` (emulador Android), `i` (simulador iOS) ou `w` (web).

## Broker e URL WebSocket

- Broker: **HiveMQ público**
- URL padrão usada pelo app: `wss://broker.hivemq.com:8884/mqtt` (WebSocket seguro, porta **8884**)
- Alternativa sem TLS: `ws://broker.hivemq.com:8000/mqtt` (porta **8000**)
- A porta **1883** é MQTT sobre TCP e **não** funciona no app.
- Nenhuma credencial é necessária nem está no repositório.

A URL pode ser alterada na tela **Configurações** e fica salva no AsyncStorage.

## Tópicos MQTT

Prefixo exclusivo do grupo: `fiap/turma/grupo01` (**troque** em `src/config/topics.ts` e use o mesmo no simulador via `TOPIC_PREFIX`).

| Tópico | Direção no app | Payload |
|---|---|---|
| `fiap/turma/grupo01/sensor/temperatura` | Subscribe (recebe) | `{"value":24.5}` |
| `fiap/turma/grupo01/sensor/umidade` | Subscribe (recebe) | `{"value":58}` |
| `fiap/turma/grupo01/lampada/comando` | Publish (envia) | `{"action":"ON"}` ou `{"action":"OFF"}` |
| `fiap/turma/grupo01/lampada/estado` | Subscribe (recebe) | `{"state":"ON"}` ou `{"state":"OFF"}` |

## Simulador do dispositivo

Está em `simulator/`. Em **outro terminal**:

```bash
cd simulator
npm install
npm start
```

Variáveis opcionais: `BROKER_URL` e `TOPIC_PREFIX` (ex.: `TOPIC_PREFIX=fiap/2tdsr/grupo07 npm start`).

O simulador publica temperatura e umidade a cada 3 s, escuta `lampada/comando` e publica `lampada/estado` (com retain) após cada comando.

### Roteiro de teste (ciclo completo)

1. Inicie o simulador e abra o app: a tela **Dashboard** mostra temperatura e umidade atualizando.
2. Toque em **Ligar**: o app publica `{"action":"ON"}`, o simulador responde `{"state":"ON"}` e o card exibe **Ligada**.
3. Toque em **Desligar**: o card passa a **Desligada** após a confirmação do simulador.
4. Veja o tráfego na aba **Histórico**.

### Alternativa sem o script (cliente web HiveMQ)

Abra o [HiveMQ WebSocket Client](https://www.hivemq.com/demos/websocket-client/), conecte ao broker público e:
- publique `{"value":24.5}` em `.../sensor/temperatura` e `{"value":58}` em `.../sensor/umidade`;
- assine `.../lampada/comando`; ao receber um comando, publique `{"state":"ON"}` (ou `OFF`) em `.../lampada/estado`.

## Funcionalidades

- **Dashboard**: status da conexão (conectando, conectado, desconectado, erro), temperatura, umidade com horário da última leitura, estado da lâmpada e botões Ligar/Desligar. O estado da lâmpada só muda quando a mensagem de estado chega; até lá aparece "Aguardando confirmação". Se o dispositivo não confirmar em 5 s, o app avisa.
- **Histórico**: 10 mensagens mais recentes (enviadas e recebidas) com tópico, payload, horário e direção. Payloads inválidos aparecem marcados e não alteram a interface.
- **Configurações**: URL do broker, Conectar/Desconectar e tema Light/Dark. URL e tema são salvos com AsyncStorage e restaurados ao abrir o app.
- **Conexão**: conecta automaticamente ao abrir, reconecta sozinha após queda e há botão **Reconectar**. Comandos com o app desconectado mostram aviso (nunca falham em silêncio).

## Arquitetura

```text
src/
  components/  ConnectionStatus, SensorCard, LampCard, MessageItem
  screens/     DashboardScreen, HistoryScreen, SettingsScreen
  services/    mqttService.ts (MQTT, sem dependência de UI), storageService.ts (AsyncStorage)
  context/     MqttContext (estado e ações), ThemeContext (tema)
  config/      topics.ts (tópicos e broker)
  types/       mqtt.ts
  themes/      colors.ts
  utils/       parsers.ts (validação de payloads), format.ts
```

`mqttService` expõe `onStatus` e `onMessage`, que retornam a função de remoção; os `useEffect` do contexto chamam essas funções na limpeza, evitando listeners duplicados.

## Prints das telas

_Adicione aqui prints de Dashboard, Histórico e Configurações (Light e Dark) em `docs/` e referencie, por exemplo: `![Dashboard](docs/dashboard.png)`._

## Limitações e observações

- O broker HiveMQ público é compartilhado e sem autenticação: use um prefixo de tópicos único para não receber mensagens de outros grupos.
- Mensagens ficam apenas em memória (o histórico zera ao fechar o app).
- A lâmpada começa como "Desconhecido" até chegar a primeira mensagem de estado (o simulador publica com retain para facilitar).
- Em rede com bloqueio de WebSocket/TLS, a conexão pode falhar; nesse caso troque a URL para a porta 8000 (ws://).
