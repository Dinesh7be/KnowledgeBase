import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { config } from './config/index.ts';
import { initializeCollection } from './services/qdrant.service.ts';
import { authRoutes } from './routes/auth.ts';
import { documentRoutes } from './routes/documents.ts';
import { chatRoutes } from './routes/chat.ts';
import { logsRoutes } from './routes/logs.ts';
import { settingsRoutes } from './routes/settings.ts';

// Extend Fastify types
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: { id: string; email: string };
        user: { id: string; email: string };
    }
}

const app = Fastify({
    logger: {
        level: config.nodeEnv === 'development' ? 'info' : 'warn',
        transport: config.nodeEnv === 'development' ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
            },
        } : undefined,
    },
});

// Register plugins
await app.register(cors, {
    origin: config.nodeEnv === 'development' ? true : ['http://localhost:3000'],
    credentials: true,
});

await app.register(jwt, {
    secret: config.jwt.secret,
    sign: {
        expiresIn: '7d',
    },
});

await app.register(multipart, {
    limits: {
        fileSize: config.upload.maxFileSize,
    },
});

await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
});

// Authentication decorator
app.decorate('authenticate', async function (request: any, reply: any) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.status(401).send({
            success: false,
            error: 'Unauthorized',
        });
    }
});

// Register routes
await app.register(authRoutes);
await app.register(documentRoutes);
await app.register(chatRoutes);
await app.register(logsRoutes);
await app.register(settingsRoutes);

// Root endpoint
app.get('/', async () => {
    return {
        name: 'KB Chatbot API',
        version: '1.0.0',
        status: 'running',
    };
});

// Start server
const start = async () => {
    try {
        // Try to initialize Qdrant collection (optional)
        try {
            await initializeCollection();
        } catch (qdrantError) {
            console.warn('⚠️  Qdrant not available - document features will be disabled');
            console.warn('    Start Qdrant with: docker-compose up -d');
        }

        await app.listen({
            port: config.port,
            host: config.host,
        });

        console.log(`🚀 Server running at http://${config.host}:${config.port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
