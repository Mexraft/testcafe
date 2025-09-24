
## Endpoint and Configuration

- URL: `ws://<host>:<port>`
- Default port: `8080`
- Configure via environment variables (see `src/websocket/config.ts`):
  - `WEBSOCKET_PORT` (default `8080`)
  - `MAX_WEBSOCKET_CONNECTIONS` (default `100`)
  - `SESSION_TIMEOUT` ms (default `1800000` = 30 min)
  - `HEARTBEAT_INTERVAL` ms (default `30000`)
  - `WEBSOCKET_LOGGING` or `NODE_ENV=development` to enable logging
  - `MAX_RECONNECTION_ATTEMPTS` (default `5`)
  - `CONNECTION_TIMEOUT` ms (default `30000`)
  - `MAX_MESSAGE_SIZE` bytes (default `1048576` = 1 MB)


## Message Envelope

All messages (client->server and server->client) share a common envelope (`WebSocketMessage`):

```
{
  type: <MessageType>,
  timestamp: <number>,
  sessionId?: <string>,
  payload: <object>
}
```

- `type` is one of `MessageType` (see below)
- `timestamp` is a UNIX epoch in milliseconds
- `sessionId` is required for many actions once a session is created
- `payload` is an object with type-specific fields

Validation rules are enforced by `MessageValidator`. Missing fields or wrong types will result in an `ERROR` message.


## Message Types and Payloads

Types are defined in `src/websocket/types.ts`.

### Client -> Server

- CONNECT (`MessageType.CONNECT`)
  - Purpose: Create a new session or reconnect to an existing one.
  - Envelope: `{ type: 'connect', timestamp, payload: { clientId?: string, sessionId?: string } }`
  - If `payload.sessionId` is provided and known, the server will try to restore that session; otherwise a new session is created.

- START_ANALYSIS (`MessageType.START_ANALYSIS`)
  - Requires `sessionId`
  - Payload: `{ requirement: string }`
  - Envelope: `{ type: 'start_analysis', timestamp, sessionId, payload }`

- USER_INPUT (`MessageType.USER_INPUT`)
  - Requires `sessionId`
  - Payload: `{ response: string }`
  - Envelope: `{ type: 'user_input', timestamp, sessionId, payload }`
  - Only valid when session state is `waiting_for_input`.

- CONVERSATION_HISTORY_REQUEST (`MessageType.CONVERSATION_HISTORY_REQUEST`)
  - Requires `sessionId`
  - Payload: `{ fromIndex?: number, limit?: number }`
  - Envelope: `{ type: 'conversation_history_request', timestamp, sessionId, payload }`

- DISCONNECT (`MessageType.DISCONNECT`)
  - Optional `sessionId`
  - Payload: `{ reason?: string }`
  - Envelope: `{ type: 'disconnect', timestamp, sessionId?, payload }`


### Server -> Client

- CONNECT (acknowledgment)
  - Sent after a successful connect or reconnect
  - Payload: `{ socketId: string, sessionId: string, reconnected: boolean, sessionRestored?: boolean, message: string }`

- PROGRESS_UPDATE
  - Requires `sessionId`
  - Payload (subset): `{ stage: string, progress: number, message?: string, ... }`

- QUESTION
  - Requires `sessionId`
  - Payload: `{ question: string, options?: string[] }`

- RESULTS
  - Requires `sessionId`
  - Payload: `{ insights: string[], visitedUrls: string[], conversationHistory: any[], finalReport?: string, metadata: { startTime: Date, endTime: Date, totalDuration: number, questionsAsked: number } }`

- CONVERSATION_SYNC / CONVERSATION_UPDATE
  - See `ConversationSyncMessage` and `ConversationUpdateMessage` in `types.ts`

- ERROR
  - Payload: `{ code: string, message: string, details?: any, recoverable: boolean, suggestedAction?: string }`
  - Possible `code` values seen in codebase: `INVALID_MESSAGE_FORMAT`, `MISSING_REQUIRED_FIELD`, `INVALID_PAYLOAD`, `SESSION_NOT_FOUND`, `INVALID_SESSION_STATE`, `NOT_WAITING_FOR_INPUT`, `MESSAGE_TOO_LARGE`, `INTERNAL_SERVER_ERROR`, `CONNECTION_FAILED`.


## Connection and Session Lifecycle

- Open WebSocket: `const ws = new WebSocket('ws://<host>:<port>')`.
- Client must send a CONNECT message after the socket opens.
- On success, server replies with CONNECT ack containing `sessionId` and `socketId`.
- Use `sessionId` for all subsequent messages.
- To restore after a network drop or reload, send CONNECT with `payload.sessionId`.

Notes:
- The server maintains activity timestamps on incoming messages. If no messages are received for roughly `CONNECTION_TIMEOUT` ms, the server may consider the connection timed out and start reconnection handling on the server side.
- There is no dedicated PING message type in the protocol. Implement reconnection logic on the client side. If your app is idle for long periods, consider sending occasional legitimate requests (e.g., a bounded `conversation_history_request`) to keep the session active, or rely purely on reconnect-with-sessionId.


## Frontend Usage (TypeScript)

### 1) Connect and establish session

```ts
const WS_URL = `ws://${location.hostname}:8080`;
let ws: WebSocket | null = null;
let sessionId: string | null = null;
let reconnectAttempts = 0;

function connect() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    // Send CONNECT (include sessionId if attempting to restore)
    const msg = {
      type: 'connect',
      timestamp: Date.now(),
      payload: sessionId ? { sessionId } : {},
    };
    ws!.send(JSON.stringify(msg));
  };

  ws.onmessage = ev => {
    const data = JSON.parse(ev.data);
    switch (data.type) {
      case 'connect':
        sessionId = data.payload.sessionId ?? data.sessionId ?? sessionId;
        reconnectAttempts = 0; // reset backoff
        console.log('Connected:', data.payload);
        break;
      case 'progress_update':
        // update UI
        break;
      case 'question':
        // prompt user
        break;
      case 'results':
        // show results
        break;
      case 'error':
        console.error('WS error', data.payload);
        break;
    }
  };

  ws.onclose = () => {
    scheduleReconnect();
  };

  ws.onerror = err => {
    console.error('WS error', err);
  };
}

function scheduleReconnect() {
  const max = 5; // align with server MAX_RECONNECTION_ATTEMPTS
  if (reconnectAttempts >= max) return;
  const base = 1000 * Math.pow(2, reconnectAttempts); // exp backoff
  const jitter = base * 0.1 * (Math.random() * 2 - 1);
  const delay = Math.max(200, Math.min(base + jitter, 30000));
  reconnectAttempts++;
  setTimeout(connect, delay);
}

connect();
```

### 2) Start analysis

```ts
function startAnalysis(requirement: string) {
  if (!ws || ws.readyState !== WebSocket.OPEN || !sessionId) return;
  const msg = {
    type: 'start_analysis',
    timestamp: Date.now(),
    sessionId,
    payload: { requirement },
  };
  ws.send(JSON.stringify(msg));
}
```

### 3) Send user input (when prompted)

```ts
function sendUserResponse(response: string) {
  if (!ws || ws.readyState !== WebSocket.OPEN || !sessionId) return;
  const msg = {
    type: 'user_input',
    timestamp: Date.now(),
    sessionId,
    payload: { response },
  };
  ws.send(JSON.stringify(msg));
}
```

### 4) Request conversation history (optional)

```ts
function requestHistory(fromIndex?: number, limit?: number) {
  if (!ws || ws.readyState !== WebSocket.OPEN || !sessionId) return;
  const msg = {
    type: 'conversation_history_request',
    timestamp: Date.now(),
    sessionId,
    payload: { fromIndex, limit },
  };
  ws.send(JSON.stringify(msg));
}
```

### 5) Graceful disconnect

```ts
function disconnect(reason?: string) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  const msg = {
    type: 'disconnect',
    timestamp: Date.now(),
    sessionId: sessionId ?? undefined,
    payload: { reason },
  };
  ws.send(JSON.stringify(msg));
  ws.close();
}
```


## Validation and Limits

- Max message size: default 1 MB (`MAX_MESSAGE_SIZE`), enforced in `message-validator.ts`.
- Required fields per message type are validated; errors are returned via `ERROR` messages.
- Always include `timestamp` (number) and the correct `type`.
- Include `sessionId` where required (`start_analysis`, `user_input`, `conversation_history_request`).


## Error Handling

The server emits `ERROR` messages with:

```
{
  type: 'error',
  timestamp,
  sessionId?: string,
  payload: {
    code: string,
    message: string,
    details?: any,
    recoverable: boolean,
    suggestedAction?: string
  }
}
```

Client recommendations:
- Log `code` and `message` for observability.
- If `recoverable` is true, you may retry the last action after a short delay.
- If the connection drops, attempt reconnect and send `CONNECT` with the last known `sessionId`.


## Notes on Heartbeats and Timeouts

- Server detects inactivity based on incoming messages and may mark a connection as timed out after ~`CONNECTION_TIMEOUT` ms.
- No explicit PING/PONG message is defined in the protocol. Implement client-side reconnection logic.
- If your UX requires long idle periods without any messages, consider a periodic, low-impact request (e.g., `conversation_history_request` with `limit: 0` or a small `limit`) to keep the session active, or rely on reconnect with `sessionId`.


## Versioning

Protocol is defined by the `MessageType` enum in `types.ts`. If you add or change a type, update this document accordingly.
