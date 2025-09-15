import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const RESPONSES_MODEL = 'gpt-4.1-mini';
const CHAT_MODEL = 'gpt-4o-mini';

function createClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is niet geconfigureerd');
  }

  return new OpenAI({ apiKey });
}

function buildPrompt({
  name,
  title,
  company,
  website,
  tone,
}: Partial<{ name: string; title: string; company: string; website: string; tone: string }>) {
  const companyPart = company ? ` bij ${company}` : '';
  const websitePart = website ? ` (website: ${website})` : '';
  const tonePart = tone || 'vriendelijk, professioneel';
  const person = name || 'een professional';
  const role = title ? `, ${title}` : '';
  return `Schrijf één korte, pakkende tagline (maximaal 18 woorden) voor ${person}${role}${companyPart}${websitePart}. Gebruik een toon die ${tonePart} aanvoelt.`;
}

function extractResponseText(result: unknown): string | undefined {
  if (!result || typeof result !== 'object') return undefined;

  const maybeOutputText = (result as { output_text?: string }).output_text;
  if (typeof maybeOutputText === 'string' && maybeOutputText.trim()) {
    return maybeOutputText.trim();
  }

  const maybeOutput = (result as { output?: Array<{ content?: Array<{ text?: { value?: string } }> }> }).output;
  const firstContent = maybeOutput?.[0]?.content?.[0];
  const value = firstContent?.text?.value;
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return undefined;
}

async function generateTagline(client: OpenAI, prompt: string) {
  try {
    const response = await client.responses.create({
      model: RESPONSES_MODEL,
      input: [
        { role: 'system', content: 'Je bent een copywriter die ultrakorte, pakkende taglines schrijft.' },
        { role: 'user', content: prompt },
      ],
      max_output_tokens: 120,
    });

    const text = extractResponseText(response);
    if (text) {
      return text;
    }
  } catch (error) {
    console.warn('Responses API mislukte, val terug op chat completions.', error);
  }

  const chatResponse = await client.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: 'system', content: 'Je bent een copywriter die ultrakorte, pakkende taglines schrijft.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 120,
    temperature: 0.7,
  });

  const fallbackText = chatResponse.choices?.[0]?.message?.content?.trim();
  if (fallbackText) {
    return fallbackText;
  }

  throw new Error('Kon geen tekst genereren via OpenAI');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  let client: OpenAI;
  try {
    client = createClient();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message || 'OpenAI niet geconfigureerd' });
    return;
  }

  try {
    const body = (req.body ?? {}) as Partial<{
      name: string;
      title: string;
      company: string;
      website: string;
      tone: string;
    }>;

    const prompt = buildPrompt(body);
    const text = await generateTagline(client, prompt);

    res.status(200).json({ text });
  } catch (error) {
    console.error('Fout bij genereren van tagline', error);
    res.status(500).json({ error: 'Kon geen tagline genereren' });
  }
}

export { buildPrompt, createClient, extractResponseText, generateTagline };
