import { WS_URL, WS_MAX_RECONNECT_ATTEMPTS } from './config';
import { MessageType, WebSocketMessage, StartAnalysisPayload } from './types';

export type WSHandlers = {
  onOpen?: (info: { sessionId?: string }) => void;
  onConnectAck?: (payload: any) => void;
  onProgress?: (payload: any) => void;
  onQuestion?: (payload: any) => void;
  onResults?: (payload: any) => void;
  onError?: (payload: any) => void;
  onClose?: (ev: CloseEvent | { code?: number; reason?: string }) => void;
};

export class AnalysisWSClient {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private reconnectAttempts = 0;
  private handlers: WSHandlers = {};
  private closedByUser = false;

  constructor(private url: string = WS_URL) {}

  setHandlers(h: WSHandlers) { this.handlers = h; }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    this.ws = new WebSocket(this.url);
    // A (re)connect attempt implies future reconnects are allowed
    this.closedByUser = false;

    this.ws.onopen = () => {
      const msg: WebSocketMessage = {
        type: MessageType.CONNECT,
        timestamp: Date.now(),
        payload: this.sessionId ? { sessionId: this.sessionId } : {},
      };
      this.ws!.send(JSON.stringify(msg));
      this.handlers.onOpen?.({ sessionId: this.sessionId || undefined });
    };

    this.ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        switch (data.type) {
          case MessageType.CONNECT:
          case 'connect':
            // Accept either payload.sessionId or top-level sessionId
            this.sessionId = data.payload?.sessionId || data.sessionId || this.sessionId;
            this.reconnectAttempts = 0;
            this.handlers.onConnectAck?.(data.payload);
            break;
          case MessageType.PROGRESS_UPDATE:
          case 'progress_update':
            this.handlers.onProgress?.(data.payload);
            break;
          case MessageType.USER_INPUT:
          case 'user_input': {
            // Server is asking user for input; normalize payload
            const value = data.payload?.value ?? data.payload?.response ?? data.payload;
            this.handlers.onQuestion?.({ value });
            break;
          }
          case MessageType.RESULTS:
          case 'results':
            this.handlers.onResults?.(data.payload);
            break;
          case MessageType.ERROR:
          case 'error':
            this.handlers.onError?.(data.payload);
            break;
          default:
            // ignore unknown
            break;
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    this.ws.onclose = (ev) => {
      this.handlers.onClose?.(ev);
      if (!this.closedByUser) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (ev: Event) => {
      console.error('WS error', ev);
    };
  }

  private scheduleReconnect() {
    const max = WS_MAX_RECONNECT_ATTEMPTS;
    if (this.closedByUser) return;
    if (this.reconnectAttempts >= max) return;
    const base = 1000 * Math.pow(2, this.reconnectAttempts);
    const jitter = base * 0.1 * (Math.random() * 2 - 1);
    const delay = Math.max(200, Math.min(base + jitter, 30000));
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), delay);
  }

  startAnalysis(requirement: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionId) return;
    const msg: WebSocketMessage<StartAnalysisPayload> = {
      type: MessageType.START_ANALYSIS,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      payload: { requirement },
    };
    this.ws.send(JSON.stringify(msg));
  }

  answerQuestion(response: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionId) return;
    const msg: WebSocketMessage<{ response: string }> = {
      type: MessageType.USER_ANSWER,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      payload: { response },
    };
    this.ws.send(JSON.stringify(msg));
  }

  disconnect(reason?: string) {
    if (!this.ws) return;
    // Prevent auto-reconnect after an intentional disconnect (e.g., unmount)
    this.closedByUser = true;
    const msg: WebSocketMessage<{ reason?: string }> = {
      type: MessageType.DISCONNECT,
      timestamp: Date.now(),
      sessionId: this.sessionId || undefined,
      payload: { reason },
    };
    try { this.ws.send(JSON.stringify(msg)); } catch {}
    try { this.ws.close(); } catch {}
  }
}

export const createAnalysisWSClient = (handlers?: WSHandlers) => {
  const c = new AnalysisWSClient();
  if (handlers) c.setHandlers(handlers);
  c.connect();
  return c;
};
