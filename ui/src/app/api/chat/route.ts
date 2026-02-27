import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt, provider, apiKey } = await req.json();

    if (!apiKey) {
      return new Response('API Key is required', { status: 400 });
    }

    let model;
    if (provider === 'OpenAI') {
      const openai = createOpenAI({
          apiKey: apiKey
      });
      model = openai('gpt-4o');
    } else if (provider === 'Anthropic') {
      const anthropic = createAnthropic({
          apiKey: apiKey
      });
      model = anthropic('claude-3-5-sonnet-20241022');
    } else {
        return new Response('Unsupported provider', { status: 400 });
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
