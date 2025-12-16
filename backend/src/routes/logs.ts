import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getChatLogs, getChatLog, deleteChatLog, clearChatLogs } from '../services/chat.service.ts';

export async function logsRoutes(app: FastifyInstance) {
    // Get paginated chat logs (filtered by user)
    app.get('/api/logs', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        const query = request.query as { page?: string; limit?: string };
        const page = parseInt(query.page || '1', 10);
        const limit = Math.min(parseInt(query.limit || '20', 10), 100);
        const user = request.user as { id: string };

        const result = getChatLogs(page, limit, user.id);

        return reply.send({
            success: true,
            ...result,
        });
    });

    // Get single chat log
    app.get('/api/logs/:id', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const log = getChatLog(id);

        if (!log) {
            return reply.status(404).send({
                success: false,
                error: 'Chat log not found',
            });
        }

        return reply.send({
            success: true,
            log,
        });
    });

    // Delete single chat log
    app.delete('/api/logs/:id', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const deleted = deleteChatLog(id);

        if (!deleted) {
            return reply.status(404).send({
                success: false,
                error: 'Chat log not found',
            });
        }

        return reply.send({
            success: true,
            message: 'Chat log deleted successfully',
        });
    });

    // Clear all chat logs
    app.delete('/api/logs', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        clearChatLogs();

        return reply.send({
            success: true,
            message: 'All chat logs cleared',
        });
    });
}
