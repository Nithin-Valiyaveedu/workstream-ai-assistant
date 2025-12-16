export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  model?: string;
  provider?: string;
}

export interface ChatSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  model?: string;
  provider?: string;
}

export interface CreateChatRequest {
  name?: string;
  provider?: 'openai' | 'anthropic' | 'gemini';
  model?: string;
}

export interface SendMessageRequest {
  content: string;
  model?: string;
  provider?: 'openai' | 'anthropic' | 'gemini';
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  chat: Chat;
}
