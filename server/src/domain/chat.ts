import { Message as LLMMessage } from '../services/llm/types';

export interface ChatMessage extends LLMMessage {
  id: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
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

export interface ChatSummary {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  model?: string;
  provider?: string;
}
