import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createXai } from '@ai-sdk/xai';
import { createMistral } from '@ai-sdk/mistral';
import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt, provider, modelName, apiKey } = await req.json();

    if (!apiKey) {
      return new Response('API Key is required', { status: 400 });
    }

    let model;
    const providerLower = provider?.toLowerCase();

    if (providerLower === 'openai' || provider === 'ChatGPT' || provider === 'GPT-4o' || provider === 'o1') {
      const openai = createOpenAI({ apiKey });
      model = openai(modelName || 'gpt-4o');
    } else if (providerLower === 'anthropic' || provider === 'Claude') {
      const anthropic = createAnthropic({ apiKey });
      model = anthropic(modelName || 'claude-3-5-sonnet-latest');
    } else if (providerLower === 'google' || provider === 'Gemini') {
      const google = createGoogleGenerativeAI({ apiKey });
      model = google(modelName || 'gemini-1.5-pro');
    } else if (providerLower === 'xai' || provider === 'Grok') {
      const xai = createXai({ apiKey });
      model = xai(modelName || 'grok-beta');
    } else if (providerLower === 'mistral') {
      const mistral = createMistral({ apiKey });
      model = mistral(modelName || 'mistral-large-latest');
    } else if (providerLower === 'groq') {
      const groq = createGroq({ apiKey });
      model = groq(modelName || 'llama-3.3-70b-versatile');
    } else {
        // Fallback to OpenAI if provider name is unknown but user gave a key
        try {
            const openai = createOpenAI({ apiKey });
            model = openai(modelName || 'gpt-4o');
        } catch (e) {
            return new Response(`Unsupported provider: ${provider}`, { status: 400 });
        }
    }

    const result = await streamText({
      model,
      system: systemPrompt,
      messages,
    });

    // @ts-ignore
    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(error.message || 'Internal Server Error', { status: 500 });
  }
}
