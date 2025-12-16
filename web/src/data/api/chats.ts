import { apiClient } from "../client";
import {
    Chat,
    ChatSummary,
    CreateChatRequest,
    SendMessageRequest,
    SendMessageResponse,
} from "../../types/chat";


//Get all chats (summaries)

export async function getChats(): Promise<ChatSummary[]> {
    const response = await apiClient.get("/chats");
    return response.data;
}


//Create a new chat
export async function createChat(
    request: CreateChatRequest = {}
): Promise<Chat> {
    const response = await apiClient.post("/chats", request);
    return response.data;
}


// Get a specific chat with all messages

export async function getChat(chatId: string): Promise<Chat> {
    const response = await apiClient.get(`/chats/${chatId}`);
    return response.data;
}

//Send a message to a chat and get LLM response

export async function sendMessage(
    chatId: string,
    request: SendMessageRequest
): Promise<SendMessageResponse> {
    const response = await apiClient.post(`/chats/${chatId}/messages`, request);
    return response.data;
}

