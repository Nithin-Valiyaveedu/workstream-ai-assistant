import { LLMProvider, LLMResponse, Message } from "./types";

export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string = "https://generativelanguage.googleapis.com/v1beta";

  constructor(apiKey: string, model: string = "gemini-2.0-flash-exp") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCompletion(messages: Message[]): Promise<LLMResponse> {
    try {
      // Gemini uses a different message format
      // System messages become part of the first user message
      const systemMessages = messages.filter((m) => m.role === "system");
      const conversationMessages = messages.filter((m) => m.role !== "system");

      // Convert to Gemini format
      const contents = conversationMessages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      // If there are system messages, prepend to first user message
      if (
        systemMessages.length > 0 &&
        contents.length > 0 &&
        contents[0].role === "user"
      ) {
        const systemText = systemMessages.map((m) => m.content).join("\n");
        contents[0].parts[0].text = `${systemText}\n\n${contents[0].parts[0].text}`;
      }

      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = (await response.json()) as any;
      const content = data.candidates[0]?.content?.parts[0]?.text || "";

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
    return "gemini";
  }

  getModelName(): string {
    return this.model;
  }
}
