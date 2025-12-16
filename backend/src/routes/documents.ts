import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
    ingestDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    getStats,
} from '../services/document.service.ts';

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'];

export async function documentRoutes(app: FastifyInstance) {
    // Upload document
    app.post('/api/documents/upload', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        try {
            const data = await request.file();

            if (!data) {
                return reply.status(400).send({
                    success: false,
                    error: 'No file uploaded',
                });
            }

            const filename = data.filename;
            const extension = filename.split('.').pop()?.toLowerCase();

            // Validate file type
            if (!['pdf', 'docx', 'txt', 'md'].includes(extension || '')) {
                return reply.status(400).send({
                    success: false,
                    error: 'Invalid file type. Allowed: PDF, DOCX, TXT, MD',
                });
            }

            const buffer = await data.toBuffer();
            const fields = data.fields as Record<string, any>;
            const category = fields?.category?.value || 'General';
            const version = fields?.version?.value || 'v1.0';
            const user = request.user as { id: string };

            const metadata = await ingestDocument(
                user.id,
                buffer,
                filename,
                data.mimetype,
                category,
                version
            );

            return reply.status(201).send({
                success: true,
                document: metadata,
            });
        } catch (error) {
            console.error('Upload error:', error);
            const message = error instanceof Error ? error.message : 'Upload failed';
            return reply.status(500).send({
                success: false,
                error: message,
            });
        }
    });

    // List all documents
    app.get('/api/documents', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        const user = request.user as { id: string };
        const documents = getDocuments(user.id);
        return reply.send({
            success: true,
            documents,
            stats: getStats(user.id),
        });
    });

    // Get single document
    app.get('/api/documents/:id', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const document = getDocument(id);

        if (!document) {
            return reply.status(404).send({
                success: false,
                error: 'Document not found',
            });
        }

        return reply.send({
            success: true,
            document,
        });
    });

    // Delete document
    app.delete('/api/documents/:id', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const deleted = await deleteDocument(id);

        if (!deleted) {
            return reply.status(404).send({
                success: false,
                error: 'Document not found',
            });
        }

        return reply.send({
            success: true,
            message: 'Document deleted successfully',
        });
    });

    // Get stats
    app.get('/api/documents/stats', {
        preHandler: [app.authenticate],
    }, async (request, reply) => {
        const user = request.user as { id: string };
        return reply.send({
            success: true,
            stats: getStats(user.id),
        });
    });
}
