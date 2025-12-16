import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3001'),
    HOST: z.string().default('0.0.0.0'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),

    QDRANT_URL: z.string().default('http://localhost:6333'),
    QDRANT_COLLECTION: z.string().default('kb_chatbot'),

    JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),

    CHUNK_SIZE: z.string().default('600'),
    CHUNK_OVERLAP: z.string().default('50'),
    SIMILARITY_THRESHOLD: z.string().default('0.7'),
    TOP_K: z.string().default('5'),
    EMBEDDING_MODEL: z.string().default('text-embedding-3-large'),
    COMPLETION_MODEL: z.string().default('gpt-4o-mini'),
    TEMPERATURE: z.string().default('0.1'),
    MAX_TOKENS: z.string().default('1000'),

    MAX_FILE_SIZE: z.string().default('52428800'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const config = {
    port: parseInt(parsed.data.PORT, 10),
    host: parsed.data.HOST,
    nodeEnv: parsed.data.NODE_ENV,

    openai: {
        apiKey: parsed.data.OPENAI_API_KEY,
        embeddingModel: parsed.data.EMBEDDING_MODEL,
        completionModel: parsed.data.COMPLETION_MODEL,
        temperature: parseFloat(parsed.data.TEMPERATURE),
        maxTokens: parseInt(parsed.data.MAX_TOKENS, 10),
    },

    qdrant: {
        url: parsed.data.QDRANT_URL,
        collection: parsed.data.QDRANT_COLLECTION,
    },

    jwt: {
        secret: parsed.data.JWT_SECRET,
    },

    rag: {
        chunkSize: parseInt(parsed.data.CHUNK_SIZE, 10),
        chunkOverlap: parseInt(parsed.data.CHUNK_OVERLAP, 10),
        similarityThreshold: parseFloat(parsed.data.SIMILARITY_THRESHOLD),
        topK: parseInt(parsed.data.TOP_K, 10),
    },

    upload: {
        maxFileSize: parseInt(parsed.data.MAX_FILE_SIZE, 10),
    },
} as const;

export type Config = typeof config;
