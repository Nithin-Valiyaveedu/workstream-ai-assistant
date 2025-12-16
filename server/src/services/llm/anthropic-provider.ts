import { LLMProvider, LLMResponse, Message } from './types';

export class AnthropicProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string = 'https://api.anthropic.com/v1';

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCompletion(messages: Message[]): Promise<LLMResponse> {
    try {
      // Anthropic API requires system messages to be separate
      const systemMessages = messages.filter(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const system = systemMessages.length > 0
        ? systemMessages.map(m => m.content).join('\n')
        : undefined;

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 4096,
          messages: conversationMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          ...(system && { system }),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${error}`);
      }

      const data = await response.json() as any;
      const content = data.content[0]?.text || '';

      return {
        content,
        model: this.model,
      };
    } catch (error) {
      throw new Error(`Failed to generate completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getProviderName(): string {
    return 'anthropic';
  }

  getModelName(): string {
    return this.model;
  }
}
