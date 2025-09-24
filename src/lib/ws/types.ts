// Shared WebSocket types for client and server (aligned with Dispatcher contract)
export enum MessageType {
  CONNECT = 'connect',
  START_ANALYSIS = 'start_analysis',
  USER_INPUT = 'user_input',
  USER_ANSWER = 'user_answer',
  PROGRESS_UPDATE = 'progress_update',
  RESULTS = 'results',
  ERROR = 'error',
  DISCONNECT = 'disconnect',
}

export interface WebSocketMessage<T = any> {
  type: MessageType;
  sessionId?: string;
  payload?: T;
  timestamp: number;
}

// Connection
export interface ConnectMessage
  extends WebSocketMessage<{ clientId?: string; sessionId?: string }> {
  type: MessageType.CONNECT;
}

// Start analysis
export interface StartAnalysisMessage
  extends WebSocketMessage<{ requirement: string }> {
  type: MessageType.START_ANALYSIS;
  sessionId: string;
}

// User input/answer messages
export interface UserInputMessage
  extends WebSocketMessage<{ response: string }> {
  type: MessageType.USER_INPUT;
  sessionId: string;
}

export interface UserAnswerMessage
  extends WebSocketMessage<{ response: string }> {
  type: MessageType.USER_ANSWER;
  sessionId: string;
}

// Progress updates
export interface ProgressPayload {
  stage: 'initialization' | 'understanding' | 'completion';
  progress: number; // 0-100
  message?: string;
}

export interface ProgressUpdateMessage
  extends WebSocketMessage<ProgressPayload> {
  type: MessageType.PROGRESS_UPDATE;
  sessionId: string;
}

// Results
export interface ResultsPayload {
  insights: string[];
  conversationHistory: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  visitedUrls?: string[];
  flowChart?: string;
}

export interface ResultsMessage extends WebSocketMessage<ResultsPayload> {
  type: MessageType.RESULTS;
  sessionId: string;
}

// Error
export interface ErrorPayload {
  code: string;
  message: string;
  recoverable?: boolean;
  details?: any;
}

export interface ErrorMessage extends WebSocketMessage<ErrorPayload> {
  type: MessageType.ERROR;
}

// Disconnect
export interface DisconnectMessage
  extends WebSocketMessage<{ reason?: string }> {
  type: MessageType.DISCONNECT;
}

// Backward-compat alias used by the client
export type StartAnalysisPayload = { requirement: string };
