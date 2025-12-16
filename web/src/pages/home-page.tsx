import { ChatSidebar } from "../components/chat-sidebar";
import { useEffect, useState, useRef } from "react";

import Spinner from "../components/ui/spinner";
import { AVAILABLE_MODELS, DEFAULT_MODEL } from "../types/models";

import {
    useChatsQuery,
    useCreateChatMutation,
} from "../data/queries/chats";
import ChatWindow from "../components/chat-window";


const SELECTED_CHAT_KEY = "selected-chat-id";
const SELECTED_MODEL_KEY = "selected-model-id";

const HomePage = () => {
    // Load selected chat from localStorage
    const [chatId, setChatId] = useState<string | null>(() => {
        return localStorage.getItem(SELECTED_CHAT_KEY);
    });

    // Load selected model from localStorage
    const [selectedModelId, setSelectedModelId] = useState<string>(() => {
        return localStorage.getItem(SELECTED_MODEL_KEY) || DEFAULT_MODEL.id;
    });

    // Persist selected chat to localStorage
    useEffect(() => {
        if (chatId) {
            localStorage.setItem(SELECTED_CHAT_KEY, chatId);
        } else {
            localStorage.removeItem(SELECTED_CHAT_KEY);
        }
    }, [chatId]);

    // Persist selected model to localStorage
    useEffect(() => {
        localStorage.setItem(SELECTED_MODEL_KEY, selectedModelId);
    }, [selectedModelId]);

    // Fetch all chats
    const {
        data: chats,
        isLoading: chatsLoading,
        error: chatsError,
    } = useChatsQuery();

    // Create new chat mutation
    const createChatMutation = useCreateChatMutation();

    // Handle creating a new chat
    const handleCreateChat = async () => {
        try {
            const selectedModel =
                AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || DEFAULT_MODEL;
            const newChat = await createChatMutation.mutateAsync({
                provider: selectedModel.provider,
                model: selectedModel.id,
            });
            setChatId(newChat.id);
        } catch (error) {
            console.error("Failed to create chat:", error);
        }
    };

    // Auto-select first chat if none selected and chats exist
    useEffect(() => {
        if (chats && chats.length > 0) {
            // Only auto-select if no chat is selected and chats exist
            if (!chatId) {
                setChatId(chats[0].id);
            } else if (!chats.find((c) => c.id === chatId)) {
                // Selected chat doesn't exist anymore, select first available
                setChatId(chats[0].id);
            }
        } else if (chats && chats.length === 0) {
            // No chats exist, clear selection
            setChatId(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chats]);

    return (
        <div className="flex flex-col items-center">
            <ChatSidebar
                chats={
                    chats?.map((chat) => ({
                        id: chat.id,
                        name: chat.name,
                    })) || []
                }
                selectedChatId={chatId}
                onSelectChat={setChatId}
                onCreateChat={handleCreateChat}
            />
            <div className="flex flex-col pt-8 max-w-4xl ms-64 w-full">
                {chatsLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Spinner />
                    </div>
                ) : chatsError ? (
                    <div className="text-red-500">
                        Error loading chats. Please try again.
                    </div>
                ) : chatId ? (
                    <ChatWindow
                        chatId={chatId}
                        selectedModelId={selectedModelId}
                        setSelectedModelId={setSelectedModelId}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-6 py-16">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-semibold">Welcome to Project Plan Generator</h2>
                            <p className="text-muted-foreground">
                                Click "New Chat" to start a conversation
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomePage;