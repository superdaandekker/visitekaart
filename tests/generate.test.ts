import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../api/generate';

const { responsesCreate, chatCreate, OpenAIMock } = vi.hoisted(() => {
  const responses = vi.fn();
  const chat = vi.fn();
  const mock = vi.fn(() => ({
    responses: { create: responses },
    chat: { completions: { create: chat } },
  }));

  return { responsesCreate: responses, chatCreate: chat, OpenAIMock: mock };
});

vi.mock('openai', () => ({
  __esModule: true,
  default: OpenAIMock,
}));

type JsonValue = unknown;

type MockResponse = VercelResponse & {
  statusCode: number;
  body?: JsonValue;
};

function createResponse(): MockResponse {
  const res = {
    statusCode: 200,
    body: undefined as JsonValue,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: JsonValue) {
      this.body = payload;
      return this;
    },
  } as MockResponse;

  return res;
}

beforeEach(() => {
  responsesCreate.mockReset();
  chatCreate.mockReset();
  OpenAIMock.mockClear();
  process.env.OPENAI_API_KEY = 'test-key';
});

describe('POST /api/generate', () => {
  it('geeft een tagline terug wanneer de Responses API data levert', async () => {
    responsesCreate.mockResolvedValue({ output_text: 'Een frisse blik voor morgen' });

    const req = { method: 'POST', body: { name: 'Ada', title: 'Engineer', company: 'ACME' } } as VercelRequest;
    const res = createResponse();

    await handler(req, res);

    expect(OpenAIMock).toHaveBeenCalledWith({ apiKey: 'test-key' });
    expect(responsesCreate).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ text: 'Een frisse blik voor morgen' });
    expect(chatCreate).not.toHaveBeenCalled();
  });

  it('meldt een configuratiefout wanneer de API-sleutel ontbreekt', async () => {
    delete process.env.OPENAI_API_KEY;

    const req = { method: 'POST', body: {} } as VercelRequest;
    const res = createResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'OPENAI_API_KEY is niet geconfigureerd' });
  });
});
