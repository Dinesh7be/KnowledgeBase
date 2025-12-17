import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { config } from '../config/index.ts';
import { clearCollection, getCollectionInfo } from '../services/qdrant.service.ts';
import { getDocuments, ingestDocument, getStats } from '../services/document.service.ts';
import { generateEmbeddings } from '../services/openai.service.ts';

// In-memory settings (extend as needed)
let settings = {
    chunkSize: config.rag.chunkSize,
    chunkOverlap: config.rag.chunkOverlap,
    similarityThreshold: config.rag.similarityThreshold,
    topK: config.rag.topK,
    maxTokens: config.openai.maxTokens,
    temperature: config.openai.temperature,
};

const settingsUpdateSchema = z.object({
    chunkSize: z.number().min(100).max(2000).optional(),
    chunkOverlap: z.number().min(0).max(200).optional(),
    similarityThreshold: z.number().min(0).max(1).optional(),
    topK: z.number().min(1).max(20).optional(),
    maxTokens: z.number().min(100).max(4000).optional(),
    temperature: z.number().min(0).max(1).optional(),
});

export async function settingsRoutes(app: FastifyInstance) {
    // Get current settings
    app.get('/api/settings', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        const collectionInfo = await getCollectionInfo();
        const user = request.user as { id: string };
        const stats = getStats(user.id);

        return reply.send({
            success: true,
            settings,
            systemInfo: {
                vectorCount: collectionInfo.vectorCount,
                vectorDbStatus: collectionInfo.status,
                documentCount: stats.documentCount,
                totalChunks: stats.totalChunks,
            },
        });
    });

    // Update settings
    app.put('/api/settings', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        try {
            const updates = settingsUpdateSchema.parse(request.body);

            settings = {
                ...settings,
                ...updates,
            };

            return reply.send({
                success: true,
                settings,
                message: 'Settings updated successfully',
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: 'Validation error',
                    details: error.issues,
                });
            }

            return reply.status(500).send({
                success: false,
                error: 'Failed to update settings',
            });
        }
    });

    // Clear vector database
    app.post('/api/settings/clear-vectors', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        try {
            await clearCollection();

            return reply.send({
                success: true,
                message: 'Vector database cleared successfully',
            });
        } catch (error) {
            console.error('Clear vectors error:', error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to clear vector database',
            });
        }
    });

    // Health check endpoint (public)
    app.get('/api/health', async (request, reply) => {
        const collectionInfo = await getCollectionInfo();

        return reply.send({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            vectorDb: {
                status: collectionInfo.status,
                vectorCount: collectionInfo.vectorCount,
            },
        });
    });
}
