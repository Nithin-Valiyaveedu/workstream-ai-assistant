import { FastifyPluginAsync } from 'fastify';
import { chatStorage } from '../../services/chat-storage';
import { LLMFactory } from '../../services/llm';
import { CreateChatRequest, SendMessageRequest } from '../../domain/chat';
import { PROJECT_PLAN_SYSTEM_PROMPT } from '../../services/system-prompts';

const chats: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

    // GET /chats - List all chats
    fastify.get('/', async function (_, reply) {
        try {
            const chatSummaries = chatStorage.getChatSummaries();
            reply.send(chatSummaries);
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({
                error: 'Failed to retrieve chats',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    // POST /chats - Create a new chat
    fastify.post<{ Body: CreateChatRequest }>('/', async function (request, reply) {
        try {
            const { name, provider, model } = request.body;

            // Use default provider if not specified
            const chatProvider = provider || 'openai';

            const chat = chatStorage.createChat(name, chatProvider, model);

            reply.status(201).send(chat);
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({
                error: 'Failed to create chat',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    // GET /chats/:id - Get a specific chat with all messages
    fastify.get<{ Params: { id: string } }>('/:id', async function (request, reply) {
        try {
            const { id } = request.params;
            const chat = chatStorage.getChat(id);

            if (!chat) {
                reply.status(404).send({
                    error: 'Chat not found',
                    message: `Chat with id ${id} does not exist`,
                });
                return;
            }

            reply.send(chat);
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({
                error: 'Failed to retrieve chat',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    // POST /chats/:id/messages - Send a message and get LLM response
    fastify.post<{
        Params: { id: string };
        Body: SendMessageRequest;
    }>('/:id/messages', async function (request, reply) {
        try {
            const { id } = request.params;
            const { content, model, provider } = request.body;

            if (!content || content.trim() === '') {
                reply.status(400).send({
                    error: 'Invalid request',
                    message: 'Message content is required',
                });
                return;
            }

            const chat = chatStorage.getChat(id);
            if (!chat) {
                reply.status(404).send({
                    error: 'Chat not found',
                    message: `Chat with id ${id} does not exist`,
                });
                return;
            }

            // Add user message
            const userMessage = chatStorage.addMessage(id, {
                role: 'user',
                content: content.trim(),
            });

            if (!userMessage) {
                reply.status(500).send({
                    error: 'Failed to add message',
                });
                return;
            }

            // Get LLM response
            // Use model/provider from request if provided, otherwise fall back to chat's stored values
            try {
                const effectiveProvider = (provider || chat.provider || 'openai') as 'openai' | 'anthropic' | 'gemini';
                const effectiveModel = model || chat.model;

                const apiKey = LLMFactory.getDefaultApiKey(effectiveProvider);
                const llmProvider = LLMFactory.createProvider(effectiveProvider, apiKey, effectiveModel);

                // Update chat's model and provider to the one being used
                if (provider && provider !== chat.provider) {
                    chat.provider = provider;
                }
                if (model && model !== chat.model) {
                    chat.model = model;
                }

                // Convert chat messages to LLM format (exclude id and timestamp)
                // Add system prompt at the beginning if this is the first message
                const llmMessages = chat.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                }));

                // Prepend system prompt if no system message exists
                const hasSystemMessage = llmMessages.some(msg => msg.role === 'system');
                if (!hasSystemMessage) {
                    llmMessages.unshift({
                        role: 'system',
                        content: PROJECT_PLAN_SYSTEM_PROMPT,
                    });
                }

                const llmResponse = await llmProvider.generateCompletion(llmMessages);

                // Add assistant message
                const assistantMessage = chatStorage.addMessage(id, {
                    role: 'assistant',
                    content: llmResponse.content,
                });

                // Return both messages
                reply.send({
                    userMessage,
                    assistantMessage,
                    chat: chatStorage.getChat(id),
                });

            } catch (llmError) {
                fastify.log.error(llmError);

                // Add an error message to the chat
                chatStorage.addMessage(id, {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error while processing your message. Please try again.',
                });

                reply.status(500).send({
                    error: 'LLM request failed',
                    message: llmError instanceof Error ? llmError.message : 'Unknown error',
                });
            }

        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({
                error: 'Failed to send message',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

};

export default chats;
