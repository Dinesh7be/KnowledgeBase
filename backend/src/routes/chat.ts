import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { processChat, createSession, getUserSessions, getSession, deleteSession } from '../services/chat.service.ts';
import { getUserByWidgetKey } from '../services/auth.service.ts';

const chatSchema = z.object({
    question: z.string().min(1).max(2000),
    sessionId: z.string().optional(),
});

const widgetChatSchema = z.object({
    question: z.string().min(1).max(2000),
    widgetKey: z.string().min(1),
    sessionId: z.string().optional(),
});

export async function chatRoutes(app: FastifyInstance) {
    // Send chat message (authenticated)
    app.post('/api/chat', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        try {
            const body = chatSchema.parse(request.body);
            const user = request.user as { id: string; email: string };

            const response = await processChat(body.question, user.id, body.sessionId);

            return reply.send({
                success: true,
                message: response,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: 'Validation error',
                    details: error.issues,
                });
            }

            console.error('Chat error:', error);
            const message = error instanceof Error ? error.message : 'Chat failed';
            return reply.status(500).send({
                success: false,
                error: message,
            });
        }
    });

    // Create new chat session
    app.post('/api/chat/sessions', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        const user = request.user as { id: string };
        const session = createSession(user.id);
        return reply.send({
            success: true,
            session,
        });
    });

    // Get user's chat sessions
    app.get('/api/chat/sessions', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        const user = request.user as { id: string };
        const sessions = getUserSessions(user.id);
        return reply.send({
            success: true,
            sessions,
        });
    });

    // Get specific session
    app.get('/api/chat/sessions/:id', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const session = getSession(id);

        if (!session) {
            return reply.status(404).send({
                success: false,
                error: 'Session not found',
            });
        }

        return reply.send({
            success: true,
            session,
        });
    });

    // Delete session
    app.delete('/api/chat/sessions/:id', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const deleted = deleteSession(id);

        return reply.send({
            success: deleted,
            message: deleted ? 'Session deleted' : 'Session not found',
        });
    });

    // Widget chat endpoint (public - uses widgetKey for account identification)
    app.post('/api/chat/widget', async (request, reply) => {
        // Add CORS headers for widget
        reply.header('Access-Control-Allow-Origin', '*');
        reply.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
        reply.header('Access-Control-Allow-Headers', 'Content-Type');

        try {
            const body = widgetChatSchema.parse(request.body);

            // Validate widget key
            const user = getUserByWidgetKey(body.widgetKey);
            if (!user) {
                return reply.status(401).send({
                    success: false,
                    error: 'Invalid widget key',
                });
            }

            // Process chat with user's ID for proper isolation
            const response = await processChat(body.question, user.id, body.sessionId);

            return reply.send({
                success: true,
                answer: response.answer,
                sources: response.sources,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: 'Validation error',
                });
            }

            console.error('Widget chat error:', error);
            return reply.status(500).send({
                success: false,
                error: 'Chat failed',
            });
        }
    });

    // CORS preflight for widget
    app.options('/api/chat/widget', async (request, reply) => {
        reply.header('Access-Control-Allow-Origin', '*');
        reply.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
        reply.header('Access-Control-Allow-Headers', 'Content-Type');
        return reply.send();
    });
}
