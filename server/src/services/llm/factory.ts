import { LLMProvider, LLMProviderType } from "./types";
import { OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";
import { GeminiProvider } from "./gemini-provider";

export class LLMFactory {
    static createProvider(
        providerType: LLMProviderType,
        apiKey: string,
        model?: string
    ): LLMProvider {
        switch (providerType) {
            case "openai":
                return new OpenAIProvider(apiKey, model);
            case "anthropic":
                return new AnthropicProvider(apiKey, model);
            case "gemini":
                return new GeminiProvider(apiKey, model);
            default:
                throw new Error(`Unknown LLM provider: ${providerType}`);
        }
    }

    static getDefaultApiKey(providerType: LLMProviderType): string {
        const envKeys = {
            openai: process.env.OPENAI_API_KEY,
            anthropic: process.env.ANTHROPIC_API_KEY,
            gemini: process.env.GEMINI_API_KEY,
        };

        const apiKey = envKeys[providerType];
        if (!apiKey) {
            throw new Error(
                `API key for ${providerType} not found in environment variables`
            );
        }

        return apiKey;
    }
}
