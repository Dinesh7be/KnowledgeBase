import OpenAI from 'openai';
import { config } from '../config/index.ts';

const openai = new OpenAI({
    apiKey: config.openai.apiKey,
});

export async function generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: config.openai.embeddingModel,
        input: text,
    });

    return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await openai.embeddings.create({
        model: config.openai.embeddingModel,
        input: texts,
    });

    return response.data.map((item) => item.embedding);
}

export async function generateChatCompletion(
    question: string,
    context: string
): Promise<string> {
    const systemPrompt = `You are a helpful assistant that answers questions based ONLY on the provided context. 
If the answer cannot be found in the context, respond with: "This information is not available in the current knowledge base."
Never make up information or use knowledge outside the provided context.
Always cite the relevant parts of the context when answering.`;

    const userPrompt = `Context:
${context}

Question: ${question}

Please answer the question based ONLY on the context provided above.`;

    const response = await openai.chat.completions.create({
        model: config.openai.completionModel,
        temperature: config.openai.temperature,
        max_tokens: config.openai.maxTokens,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
    });

    return response.choices[0]?.message?.content || 'Unable to generate a response.';
}
