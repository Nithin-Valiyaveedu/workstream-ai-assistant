import { useEffect, useRef } from "react";

import { useChatQuery } from "../data/queries/chats";
import { useSendMessageMutation } from "../data/queries/chats";
import { MessageContent } from "./message-content";
import { ModelSelector } from "./model-selector";
import { ChatInputBox } from "./chat-input-box";
import Spinner from "./ui/spinner";
import { AVAILABLE_MODELS, DEFAULT_MODEL } from "../types/models";
import { AssistantLoadingIndicator, Message, MessageContainer } from "./message";

const ChatWindow = ({
    chatId,
    selectedModelId,
    setSelectedModelId,
}: {
    chatId: string;
    selectedModelId: string;
    setSelectedModelId: (id: string) => void;
}) => {
    // Fetch specific chat with messages
    const { data: chat, isLoading, error } = useChatQuery(chatId);

    // Send message mutation
    const sendMessageMutation = useSendMessageMutation(chatId);
    const { reset } = sendMessageMutation;

    // Clear any previous "send message" error/loading state
    useEffect(() => {
        reset();
    }, [chatId, reset]);

    // Ref for auto-scroll
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages, sendMessageMutation.isPending]);

    // Handle sending a message
    const handleSendMessage = async (content: string) => {
        try {
            // Get the selected model info
            const selectedModel =
                AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || DEFAULT_MODEL;

            await sendMessageMutation.mutateAsync({
                content,
                model: selectedModel.id,
                provider: selectedModel.provider,
            });
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-red-500">
                    Error loading chat. It may have been deleted.
                </p>
                <p className="text-muted-foreground text-sm">
                    Please select another chat or create a new one.
                </p>
            </div>
        );
    }

    if (!chat) {
        return null;
    }

    // Convert backend messages to frontend format
    const messages: Message[] = chat.messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
    }));

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-semibold">{chat.name}</h2>
                </div>
                <div className="w-64 flex-shrink-0">
                    <ModelSelector
                        value={selectedModelId}
                        onValueChange={setSelectedModelId}
                    />
                </div>
            </div>

            {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    Start a conversation by sending a message below.
                </div>
            ) : (
                messages.map((message, index) => (
                    <MessageContainer role={message.role} key={index}>
                        <MessageContent content={message.content} />
                    </MessageContainer>
                ))
            )}

            {sendMessageMutation.isPending && <AssistantLoadingIndicator />}

            {sendMessageMutation.isError && (
                <div className="text-red-500 text-sm">
                    Failed to send message. Please try again.
                </div>
            )}
            <div ref={messagesEndRef} />

            <ChatInputBox
                onSend={handleSendMessage}
                disabled={sendMessageMutation.isPending}
            />
        </div>
    );
}

export default ChatWindow