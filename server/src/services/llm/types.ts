export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMResponse {
  content: string;
  model?: string;
}

export interface LLMProvider {
  // Generate a completion based on the conversation history

  generateCompletion(messages: Message[]): Promise<LLMResponse>;

  // Get the name of the provider
  getProviderName(): string;

  // Get the model being used
  getModelName(): string;
}

export type LLMProviderType = "openai" | "anthropic" | "gemini";

export interface LLMConfig {
  provider: LLMProviderType;
  apiKey: string;
  model?: string;
}
