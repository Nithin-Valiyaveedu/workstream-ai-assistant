import { LLMProvider, LLMResponse, Message } from "./types";

export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string = "https://api.openai.com/v1";

  constructor(apiKey: string, model: string = "gpt-4o-mini") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCompletion(messages: Message[]): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data = (await response.json()) as any;
      const content = data.choices[0]?.message?.content || "";

      return {
        content,
        model: this.model,
      };
    } catch (error) {
      throw new Error(
        `Failed to generate completion: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  getProviderName(): string {
    return "openai";
  }

  getModelName(): string {
    return this.model;
  }
}
