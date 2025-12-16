import { Chat, ChatMessage, ChatSummary } from "../domain/chat";
import { randomUUID } from "crypto";

// In-memory storage for chats
export class ChatStorage {
    private chats: Map<string, Chat> = new Map();

    // Create a new chat
    createChat(name?: string, provider?: string, model?: string): Chat {
        const chat: Chat = {
            id: randomUUID(),
            name: name || `Chat ${this.chats.size + 1}`,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            provider,
            model,
        };

        this.chats.set(chat.id, chat);
        return chat;
    }

    // Get a chat by ID
    getChat(chatId: string): Chat | undefined {
        return this.chats.get(chatId);
    }

    // Get all chats
    getAllChats(): Chat[] {
        return Array.from(this.chats.values()).sort(
            (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
        );
    }

    // Get chat summaries (without full message history)
    getChatSummaries(): ChatSummary[] {
        return this.getAllChats().map((chat) => ({
            id: chat.id,
            name: chat.name,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            messageCount: chat.messages.length,
            provider: chat.provider,
            model: chat.model,
        }));
    }

    // Add a message to a chat
    addMessage(
        chatId: string,
        message: Omit<ChatMessage, "id" | "timestamp">
    ): ChatMessage | null {
        const chat = this.chats.get(chatId);
        if (!chat) {
            return null;
        }

        const chatMessage: ChatMessage = {
            ...message,
            id: randomUUID(),
            timestamp: new Date(),
        };

        chat.messages.push(chatMessage);
        chat.updatedAt = new Date();

        return chatMessage;
    }
}

// Singleton instance
export const chatStorage = new ChatStorage();
