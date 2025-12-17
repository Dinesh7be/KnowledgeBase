import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../config/index.ts';
import { v4 as uuidv4 } from 'uuid';

const client = new QdrantClient({ url: config.qdrant.url });

export interface VectorPayload {
    [key: string]: unknown; // Index signature for Qdrant compatibility
    userId: string; // For per-user isolation
    docId: string;
    source: string;
    chunkId: number;
    text: string;
    category: string;
    version: string;
    uploadedAt: string;
}

export interface SearchResult {
    id: string;
    score: number;
    payload: VectorPayload;
}

export async function initializeCollection(): Promise<void> {
    const collections = await client.getCollections();
    const exists = collections.collections.some(
        (c) => c.name === config.qdrant.collection
    );

    if (!exists) {
        await client.createCollection(config.qdrant.collection, {
            vectors: {
                size: 3072, // text-embedding-3-large dimension
                distance: 'Cosine',
            },
        });
        console.log(`✅ Created collection: ${config.qdrant.collection}`);
    } else {
        console.log(`✅ Collection already exists: ${config.qdrant.collection}`);
    }
}

export async function upsertVectors(
    userId: string,
    docId: string,
    source: string,
    chunks: string[],
    embeddings: number[][],
    category: string,
    version: string
): Promise<void> {
    const points = chunks.map((text, index) => ({
        id: uuidv4(),
        vector: embeddings[index],
        payload: {
            userId,
            docId,
            source,
            chunkId: index,
            text,
            category,
            version,
            uploadedAt: new Date().toISOString(),
        } as VectorPayload,
    }));

    await client.upsert(config.qdrant.collection, {
        wait: true,
        points,
    });

    console.log(`✅ Upserted ${points.length} vectors for user ${userId}, document: ${source}`);
}

export async function searchSimilar(
    userId: string,
    embedding: number[],
    topK: number = config.rag.topK
): Promise<SearchResult[]> {
    const results = await client.search(config.qdrant.collection, {
        vector: embedding,
        limit: topK,
        with_payload: true,
        filter: {
            must: [
                {
                    key: 'userId',
                    match: { value: userId },
                },
            ],
        },
    });

    return results.map((result) => ({
        id: result.id as string,
        score: result.score,
        payload: result.payload as VectorPayload,
    }));
}

export async function deleteByDocId(docId: string): Promise<void> {
    await client.delete(config.qdrant.collection, {
        wait: true,
        filter: {
            must: [
                {
                    key: 'docId',
                    match: { value: docId },
                },
            ],
        },
    });

    console.log(`✅ Deleted vectors for document: ${docId}`);
}

export async function getCollectionInfo(): Promise<{
    vectorCount: number;
    status: string;
}> {
    try {
        const info = await client.getCollection(config.qdrant.collection);
        return {
            vectorCount: info.points_count || 0,
            status: info.status,
        };
    } catch (error) {
        return {
            vectorCount: 0,
            status: 'not_found',
        };
    }
}

export async function clearCollection(): Promise<void> {
    try {
        await client.deleteCollection(config.qdrant.collection);
        await initializeCollection();
        console.log(`✅ Cleared and recreated collection: ${config.qdrant.collection}`);
    } catch (error) {
        console.error('Error clearing collection:', error);
        throw error;
    }
}
