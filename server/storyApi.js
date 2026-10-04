import Groq from 'groq-sdk';

/**
 * The story API, shared by the local Express server (server/index.js)
 * and the Vercel functions (api/*.js). Each handler returns { status, body }.
 *
 * Env vars are read on every call: in ESM this module loads before
 * server/index.js has run dotenv.
 */

const IMAGE_PROMPTS_INSTRUCTION = `You write prompts for a text-to-image model that illustrates a children's picture book.
Given the story pages, return JSON: {"character": string, "prompts": string[]} with exactly one prompt per page, in English.
- "character": a fixed visual description of the main character(s) (species, colors, clothing, distinctive features), max 30 words.
- Each prompt: one concrete scene, max 40 words: who (repeat the character description briefly), what they are doing, where, key objects, mood/lighting.
- Only visible things. No text in the scene, no abstract feelings without a visual.`;

export const getGroqModel = () => process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
export const isGroqConfigured = () => !!process.env.GROQ_API_KEY;

let groqClient = null;
const getGroq = () => {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

const chat = (messages, options = {}) => {
  const model = getGroqModel();
  return getGroq().chat.completions.create({
    model,
    messages,
    // gpt-oss models reason before answering; low effort keeps generation fast
    ...(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {}),
    ...options
  });
};

/* ---------- Per-visitor rate limit ---------- */

// Counts requests per IP in memory over a sliding hour. On Vercel each function
// instance keeps its own count and instances come and go, so this is a
// best-effort guard against casual abuse of the Groq key, not a hard quota.
const HOUR_MS = 60 * 60 * 1000;
const hits = new Map();

const isRateLimited = (bucket, ip, maxPerHour) => {
  if (!ip || maxPerHour <= 0) return false;
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) || []).filter(time => now - time < HOUR_MS);
  if (recent.length >= maxPerHour) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
};

const storiesPerHour = () => Number(process.env.STORIES_PER_HOUR ?? 15);

/* ---------- Handlers ---------- */

const notConfigured = () => ({
  status: 500,
  body: {
    error: 'GROQ_NOT_CONFIGURED',
    hint: 'Set the GROQ_API_KEY environment variable'
  }
});

const tooManyStories = () => ({ status: 429, body: { error: 'TOO_MANY_STORIES' } });

const groqError = (error, fallbackMessage) => {
  console.error('Groq error:', error);

  if (error instanceof Groq.AuthenticationError) {
    return { status: 401, body: { error: 'GROQ_UNAUTHORIZED' } };
  }
  if (error instanceof Groq.RateLimitError) {
    return { status: 429, body: { error: 'GROQ_RATE_LIMITED' } };
  }

  return { status: 500, body: { error: fallbackMessage, message: error.message } };
};

export const health = () => ({
  status: 200,
  body: { status: 'ok', groqConfigured: isGroqConfigured() }
});

export const generateStory = async (body, ip) => {
  const { prompt, systemInstruction } = body || {};

  if (!prompt) {
    return { status: 400, body: { error: 'Prompt is required' } };
  }
  if (!isGroqConfigured()) return notConfigured();
  if (isRateLimited('story', ip, storiesPerHour())) return tooManyStories();

  try {
    const completion = await chat([
      ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
      { role: 'user', content: prompt }
    ], { temperature: 0.9 });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { status: 502, body: { error: 'Empty response from Groq' } };
    }

    return { status: 200, body: { content } };
  } catch (error) {
    return groqError(error, 'Story generation failed');
  }
};

// Turns story pages (any language) into short English scene prompts for the image model,
// sharing one character description so the illustrations stay consistent
export const imagePrompts = async (body, ip) => {
  const { pages } = body || {};

  if (!Array.isArray(pages) || pages.length === 0) {
    return { status: 400, body: { error: 'pages must be a non-empty array' } };
  }
  if (!isGroqConfigured()) return notConfigured();
  // Called once per illustrated story, so it shares the story allowance
  if (isRateLimited('image-prompts', ip, storiesPerHour())) return tooManyStories();

  try {
    const completion = await chat([
      { role: 'system', content: IMAGE_PROMPTS_INSTRUCTION },
      { role: 'user', content: JSON.stringify({ pages }) }
    ], { temperature: 0.5, response_format: { type: 'json_object' } });

    const data = JSON.parse(completion.choices[0]?.message?.content || '{}');
    if (typeof data.character !== 'string' || !Array.isArray(data.prompts) || data.prompts.length !== pages.length) {
      return { status: 502, body: { error: 'Invalid image prompts from Groq' } };
    }

    return { status: 200, body: { character: data.character, prompts: data.prompts } };
  } catch (error) {
    return groqError(error, 'Image prompt generation failed');
  }
};

/* ---------- Vercel (Web standard) adapter ---------- */

/** Client IP behind Vercel's proxy */
export const requestIp = (request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '';

/** Wrap a { status, body } handler as a Web-standard POST function */
export const webHandler = (handler) => async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const result = await handler(body, requestIp(request));
  return Response.json(result.body, { status: result.status });
};
