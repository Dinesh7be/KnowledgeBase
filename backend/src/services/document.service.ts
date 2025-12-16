import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
import { config } from '../config/index.ts';
import { v4 as uuidv4 } from 'uuid';
import { generateEmbeddings } from './openai.service.ts';
import { upsertVectors, deleteByDocId } from './qdrant.service.ts';

export interface DocumentMetadata {
    id: string;
    userId: string; // For per-user isolation
    name: string;
    type: string;
    category: string;
    version: string;
    chunkCount: number;
    uploadedAt: string;
}

// In-memory document store (replace with database in production)
const documents = new Map<string, DocumentMetadata>();

export function getDocuments(userId: string): DocumentMetadata[] {
    return Array.from(documents.values()).filter(doc => doc.userId === userId);
}

export function getDocument(id: string): DocumentMetadata | undefined {
    return documents.get(id);
}

export async function extractText(
    buffer: Buffer,
    filename: string,
    mimeType: string
): Promise<string> {
    const extension = filename.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            const pdfData = await pdf(buffer);
            return pdfData.text;

        case 'docx':
            const docxResult = await mammoth.extractRawText({ buffer });
            return docxResult.value;

        case 'txt':
        case 'md':
            return buffer.toString('utf-8');

        default:
            throw new Error(`Unsupported file type: ${extension}`);
    }
}

export function chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/);

    let currentChunk = '';
    let currentTokenCount = 0;

    for (const sentence of sentences) {
        // Rough token estimation: 1 token ≈ 4 characters
        const sentenceTokens = Math.ceil(sentence.length / 4);

        if (currentTokenCount + sentenceTokens > chunkSize && currentChunk) {
            chunks.push(currentChunk.trim());

            // Keep overlap from previous chunk
            const words = currentChunk.split(' ');
            const overlapWords = words.slice(-Math.floor(overlap / 4));
            currentChunk = overlapWords.join(' ') + ' ';
            currentTokenCount = Math.ceil(currentChunk.length / 4);
        }

        currentChunk += sentence + ' ';
        currentTokenCount += sentenceTokens;
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

export async function ingestDocument(
    userId: string,
    buffer: Buffer,
    filename: string,
    mimeType: string,
    category: string = 'General',
    version: string = 'v1.0'
): Promise<DocumentMetadata> {
    // Extract text from document
    const text = await extractText(buffer, filename, mimeType);

    if (!text.trim()) {
        throw new Error('Document appears to be empty or could not be parsed');
    }

    // Chunk the text
    const chunks = chunkText(text, config.rag.chunkSize, config.rag.chunkOverlap);

    if (chunks.length === 0) {
        throw new Error('No chunks could be created from the document');
    }

    // Generate embeddings for all chunks
    const embeddings = await generateEmbeddings(chunks);

    // Generate document ID
    const docId = uuidv4();

    // Store in Qdrant with userId for isolation
    await upsertVectors(userId, docId, filename, chunks, embeddings, category, version);

    // Store metadata
    const metadata: DocumentMetadata = {
        id: docId,
        userId,
        name: filename,
        type: filename.split('.').pop()?.toLowerCase() || 'unknown',
        category,
        version,
        chunkCount: chunks.length,
        uploadedAt: new Date().toISOString(),
    };

    documents.set(docId, metadata);

    return metadata;
}

export async function deleteDocument(docId: string): Promise<boolean> {
    const doc = documents.get(docId);
    if (!doc) {
        return false;
    }

    await deleteByDocId(docId);
    documents.delete(docId);

    return true;
}

export function getStats(userId: string): { documentCount: number; totalChunks: number } {
    const docs = Array.from(documents.values()).filter(doc => doc.userId === userId);
    return {
        documentCount: docs.length,
        totalChunks: docs.reduce((sum, doc) => sum + doc.chunkCount, 0),
    };
}
