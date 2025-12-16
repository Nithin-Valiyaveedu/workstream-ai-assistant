export type LLMProvider = 'openai' | 'anthropic' | 'gemini';

export interface ModelOption {
    id: string;
    name: string;
    provider: LLMProvider;
    description?: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
    // OpenAI Models
    {
        id: 'gpt-5.2',
        name: 'GPT-5.2',
        provider: 'openai',
        description: 'Most capable OpenAI model',
    },
    {
        id: 'gpt-5-mini',
        name: 'GPT-5 Mini',
        provider: 'openai',
        description: 'Fast and cost-effective',
    },
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        description: 'Previous generation flagship',
    },

    // Anthropic Models
    {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        description: 'Best for complex tasks',
    },
    {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        description: 'Fast and efficient',
    },
    {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        description: 'Most powerful Claude model',
    },

    // Gemini Models
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'gemini',
        description: 'Long context understanding',
    },
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'gemini',
        description: 'Fast multimodal model',
    },

    {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'gemini',
        description: 'Fast and efficient',
    },
];

export const DEFAULT_MODEL: ModelOption = AVAILABLE_MODELS[0]; // GPT-5.2
