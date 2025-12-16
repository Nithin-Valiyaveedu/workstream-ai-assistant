import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CreateChatRequest, SendMessageRequest } from "../../types/chat";
import {
    createChat,
    getChat,
    getChats,
    sendMessage,
} from "../api/chats";


//Query key factory for chats

export const chatKeys = {
    all: ["chats"] as const,
    lists: () => [...chatKeys.all, "list"] as const,
    list: () => [...chatKeys.lists()] as const,
    details: () => [...chatKeys.all, "detail"] as const,
    detail: (id: string) => [...chatKeys.details(), id] as const,
};

//Hook to fetch all chats summaries

export function useChatsQuery() {
    return useQuery({
        queryKey: chatKeys.list(),
        queryFn: getChats,
    });
}

//Hook to fetch a specific chat with messages

export function useChatQuery(chatId: string | null) {
    return useQuery({
        queryKey: chatKeys.detail(chatId || ""),
        queryFn: () => getChat(chatId!),
        enabled: !!chatId,
    });
}

//Hook to create a new chat

export function useCreateChatMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateChatRequest = {}) => createChat(request),
        onSuccess: (newChat) => {
            // Optimistically add the chat to the detail cache
            queryClient.setQueryData(chatKeys.detail(newChat.id), newChat);

            // Optimistically add to chats list
            queryClient.setQueryData(chatKeys.list(), (old: any) => {
                if (!old) return [newChat];
                return [newChat, ...old];
            });
        },
    });
}

//Hook to send a message to a chat

export function useSendMessageMutation(chatId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: SendMessageRequest) => sendMessage(chatId, request),

        // Optimistically update the UI before the request completes
        onMutate: async (request) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: chatKeys.detail(chatId) });

            // Snapshot the previous value
            const previousChat = queryClient.getQueryData(chatKeys.detail(chatId));

            // Optimistically update to show user message immediately
            queryClient.setQueryData(chatKeys.detail(chatId), (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    messages: [
                        ...old.messages,
                        {
                            id: "temp-" + Date.now(),
                            role: "user",
                            content: request.content,
                            timestamp: new Date().toISOString(),
                        },
                    ],
                };
            });

            // Return context with the previous value
            return { previousChat };
        },

        onSuccess: (response) => {
            // Update the chat in the cache with actual messages from server
            queryClient.setQueryData(chatKeys.detail(chatId), response.chat);

            // Invalidate the chats list to update the "updatedAt" timestamp
            queryClient.invalidateQueries({ queryKey: chatKeys.list() });
        },

        // If the mutation fails, rollback to the previous value
        onError: (err, variables, context) => {
            if (context?.previousChat) {
                queryClient.setQueryData(chatKeys.detail(chatId), context.previousChat);
            }
        },
    });
}
