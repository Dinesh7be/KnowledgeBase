import { config } from '../config/index.ts';
import { generateEmbedding, generateChatCompletion } from './openai.service.ts';
import { searchSimilar, type SearchResult } from './qdrant.service.ts';
import { v4 as uuidv4 } from 'uuid';

const FALLBACK_MESSAGE = 'This information is not available in the current knowledge base';

// Greeting patterns and responses
const GREETING_PATTERNS = [
    /^(hi|hello|hey|hii+|helo+|greetings|good\s*(morning|afternoon|evening|day))[\s!.,?]*$/i,
    /^(what'?s?\s*up|howdy|yo|sup)[\s!.,?]*$/i,
    /^(namaste|hola|bonjour)[\s!.,?]*$/i
];

const GREETING_RESPONSES = [
    "Hello! 👋 I'm your Knowledge Base Assistant. How can I help you today? Feel free to ask me any questions about your uploaded documents!",
    "Hi there! 😊 Welcome! I'm here to help you find information from your knowledge base. What would you like to know?",
    "Hey! 👋 Great to see you! I can answer questions based on your uploaded documents. What can I help you with?",
    "Hello! I'm your AI assistant ready to help! Ask me anything about your documents and I'll do my best to assist you.",
    "Greetings! 🌟 I'm here to help you explore your knowledge base. What questions do you have for me today?"
];

// Thanks/acknowledgment patterns and responses
const THANKS_PATTERNS = [
    /^(ok(ay)?|alright|got it|understood|i see|makes sense)[\s!.,?]*$/i,
    /^(thanks?|thank you|thanx|thx|ty|thank u)[\s!.,?]*$/i,
    /^(ok(ay)?\s*(thanks?|thank you|thanx)|thanks?\s*ok(ay)?)[\s!.,?]*$/i,
    /^(great|awesome|perfect|cool|nice|good)[\s!.,?]*$/i,
    /^(that('s| is)?\s*(helpful|great|good|nice|perfect))[\s!.,?]*$/i,
    /^(appreciate it|much appreciated)[\s!.,?]*$/i
];

const THANKS_RESPONSES = [
    "You're welcome! 😊 Is there anything else you'd like to know?",
    "Happy to help! 👍 Feel free to ask if you have more questions!",
    "Glad I could assist! Let me know if you need anything else.",
    "No problem! 🌟 I'm here if you have any other questions.",
    "Anytime! Feel free to ask me more questions about your knowledge base.",
    "You're welcome! I'm always here to help you find information. 😊"
];

function isGreeting(text: string): boolean {
    const trimmed = text.trim().toLowerCase();
    return GREETING_PATTERNS.some(pattern => pattern.test(trimmed));
}

function isThanks(text: string): boolean {
    const trimmed = text.trim().toLowerCase();
    return THANKS_PATTERNS.some(pattern => pattern.test(trimmed));
}

function getGreetingResponse(): string {
    const randomIndex = Math.floor(Math.random() * GREETING_RESPONSES.length);
    return GREETING_RESPONSES[randomIndex];
}

function getThanksResponse(): string {
    const randomIndex = Math.floor(Math.random() * THANKS_RESPONSES.length);
    return THANKS_RESPONSES[randomIndex];
}

// Session-based chat structure
export interface ChatMessageItem {
    question: string;
    answer: string;
    sources: Array<{
        source: string;
        text: string;
        score: number;
    }>;
    timestamp: string;
}

export interface ChatSession {
    id: string;
    userId: string;
    messages: ChatMessageItem[];
    createdAt: string;
    updatedAt: string;
}

// Legacy single message format for backward compatibility
export interface ChatMessage {
    id: string;
    question: string;
    answer: string;
    sources: Array<{
        source: string;
        text: string;
        score: number;
    }>;
    timestamp: string;
    userId?: string;
    sessionId?: string;
}

// In-memory stores
const chatLogs: ChatMessage[] = [];
const chatSessions = new Map<string, ChatSession>();

export async function processChat(
    question: string,
    userId: string,
    sessionId?: string
): Promise<ChatMessage> {
    let answer: string;
    let sources: ChatMessage['sources'] = [];

    // Check if it's a thanks/acknowledgment
    if (isThanks(question)) {
        answer = getThanksResponse();
    }
    // Check if it's a greeting
    else if (isGreeting(question)) {
        answer = getGreetingResponse();
    } else {
        // Step 1: Generate embedding for the question
        const questionEmbedding = await generateEmbedding(question);

        // Step 2: Search for similar chunks in Qdrant (filtered by userId)
        const searchResults = await searchSimilar(userId, questionEmbedding, config.rag.topK);

        // Step 3: Filter by similarity threshold
        const validResults = searchResults.filter(
            (result) => result.score >= config.rag.similarityThreshold
        );

        if (validResults.length === 0) {
            // No relevant context found
            answer = FALLBACK_MESSAGE;
        } else {
            // Step 4: Build context from valid results
            const context = validResults
                .map((result) => `[Source: ${result.payload.source}]\n${result.payload.text}`)
                .join('\n\n---\n\n');

            // Step 5: Generate answer using context
            answer = await generateChatCompletion(question, context);

            // Prepare sources for response
            sources = validResults.map((result) => ({
                source: result.payload.source,
                text: result.payload.text.substring(0, 200) + '...',
                score: result.score,
            }));
        }
    }

    // Step 6: Create/update session and log the chat
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    // If sessionId provided, add to existing session
    if (sessionId && chatSessions.has(sessionId)) {
        const session = chatSessions.get(sessionId)!;
        session.messages.push({
            question,
            answer,
            sources,
            timestamp,
        });
        session.updatedAt = timestamp;
    } else if (sessionId) {
        // Create new session with this ID
        chatSessions.set(sessionId, {
            id: sessionId,
            userId,
            messages: [{
                question,
                answer,
                sources,
                timestamp,
            }],
            createdAt: timestamp,
            updatedAt: timestamp,
        });
    }

    // Also log as individual message for backward compatibility
    const chatMessage: ChatMessage = {
        id: messageId,
        question,
        answer,
        sources,
        timestamp,
        userId,
        sessionId,
    };

    chatLogs.unshift(chatMessage);

    // Keep only last 1000 logs in memory
    if (chatLogs.length > 1000) {
        chatLogs.pop();
    }

    return chatMessage;
}

// Session management functions
export function createSession(userId: string): ChatSession {
    const session: ChatSession = {
        id: uuidv4(),
        userId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    chatSessions.set(session.id, session);
    return session;
}

export function getSession(sessionId: string): ChatSession | undefined {
    return chatSessions.get(sessionId);
}

export function getUserSessions(userId: string): ChatSession[] {
    return Array.from(chatSessions.values())
        .filter(session => session.userId === userId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function deleteSession(sessionId: string): boolean {
    return chatSessions.delete(sessionId);
}

// Legacy log functions
export function getChatLogs(
    page: number = 1,
    limit: number = 20,
    userId?: string
): { logs: ChatMessage[]; total: number; page: number; pages: number } {
    let filteredLogs = userId
        ? chatLogs.filter(log => log.userId === userId)
        : chatLogs;

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedLogs = filteredLogs.slice(start, end);

    return {
        logs: paginatedLogs,
        total: filteredLogs.length,
        page,
        pages: Math.ceil(filteredLogs.length / limit),
    };
}

export function getChatLog(id: string): ChatMessage | undefined {
    return chatLogs.find((log) => log.id === id);
}

export function deleteChatLog(id: string): boolean {
    const index = chatLogs.findIndex((log) => log.id === id);
    if (index !== -1) {
        chatLogs.splice(index, 1);
        return true;
    }
    return false;
}

export function clearChatLogs(): void {
    chatLogs.length = 0;
    chatSessions.clear();
}
