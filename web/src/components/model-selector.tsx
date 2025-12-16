import { AVAILABLE_MODELS, DEFAULT_MODEL, ModelOption } from "../types/models";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

interface ModelSelectorProps {
    value: string;
    onValueChange: (modelId: string) => void;
}

export function ModelSelector({ value, onValueChange }: ModelSelectorProps) {
    // Group models by provider
    const modelsByProvider = AVAILABLE_MODELS.reduce((acc, model) => {
        if (!acc[model.provider]) {
            acc[model.provider] = [];
        }
        acc[model.provider].push(model);
        return acc;
    }, {} as Record<string, ModelOption[]>);

    const providerNames = {
        openai: "OpenAI",
        anthropic: "Anthropic",
        gemini: "Google Gemini",
    };

    // Ensure we always have a valid value
    const currentValue = value || DEFAULT_MODEL.id;

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Available AI Models</label>
            <Select value={currentValue} onValueChange={onValueChange}>
                <SelectTrigger className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(modelsByProvider).map(([provider, models]) => (
                        <SelectGroup key={provider}>
                            <SelectLabel>{providerNames[provider as keyof typeof providerNames]}</SelectLabel>
                            {models.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                    {model.name} {model.description ? `- ${model.description}` : ''}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
