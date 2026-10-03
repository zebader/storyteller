import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

// Load environment variables from the project root .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Loaded .env file from:', envPath);
} else {
  console.warn('⚠️  .env file not found at:', envPath);
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3001;
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const isGroqConfigured = () => !!process.env.GROQ_API_KEY;

let groqClient = null;
const getGroq = () => {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

console.log('\n📋 Environment Check:');
console.log('   GROQ_API_KEY:', isGroqConfigured() ? '✅ Set' : '❌ Not set');
console.log('   GROQ_MODEL:', GROQ_MODEL);
console.log('   PORT:', PORT);
console.log('');

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', groqConfigured: isGroqConfigured() });
});

const IMAGE_PROMPTS_INSTRUCTION = `You write prompts for a text-to-image model that illustrates a children's picture book.
Given the story pages, return JSON: {"character": string, "prompts": string[]} with exactly one prompt per page, in English.
- "character": a fixed visual description of the main character(s) (species, colors, clothing, distinctive features), max 30 words.
- Each prompt: one concrete scene, max 40 words: who (repeat the character description briefly), what they are doing, where, key objects, mood/lighting.
- Only visible things. No text in the scene, no abstract feelings without a visual.`;

const chat = (messages, options = {}) =>
  getGroq().chat.completions.create({
    model: GROQ_MODEL,
    messages,
    // gpt-oss models reason before answering; low effort keeps generation fast
    ...(GROQ_MODEL.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {}),
    ...options
  });

const requireGroq = (req, res, next) => {
  if (!isGroqConfigured()) {
    return res.status(500).json({
      error: 'GROQ_NOT_CONFIGURED',
      hint: 'Add GROQ_API_KEY to the .env file in the project root'
    });
  }
  next();
};

const sendGroqError = (res, error, fallbackMessage) => {
  console.error('Groq error:', error);

  if (error instanceof Groq.AuthenticationError) {
    return res.status(401).json({ error: 'GROQ_UNAUTHORIZED' });
  }
  if (error instanceof Groq.RateLimitError) {
    return res.status(429).json({ error: 'GROQ_RATE_LIMITED' });
  }

  res.status(500).json({ error: fallbackMessage, message: error.message });
};

app.post('/api/generate-story', requireGroq, async (req, res) => {
  const { prompt, systemInstruction } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const completion = await chat([
      ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
      { role: 'user', content: prompt }
    ], { temperature: 0.9 });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: 'Empty response from Groq' });
    }

    res.json({ content });
  } catch (error) {
    sendGroqError(res, error, 'Story generation failed');
  }
});

// Turns story pages (any language) into short English scene prompts for the image model,
// sharing one character description so the illustrations stay consistent
app.post('/api/image-prompts', requireGroq, async (req, res) => {
  const { pages } = req.body;

  if (!Array.isArray(pages) || pages.length === 0) {
    return res.status(400).json({ error: 'pages must be a non-empty array' });
  }

  try {
    const completion = await chat([
      { role: 'system', content: IMAGE_PROMPTS_INSTRUCTION },
      { role: 'user', content: JSON.stringify({ pages }) }
    ], { temperature: 0.5, response_format: { type: 'json_object' } });

    const data = JSON.parse(completion.choices[0]?.message?.content || '{}');
    if (typeof data.character !== 'string' || !Array.isArray(data.prompts) || data.prompts.length !== pages.length) {
      return res.status(502).json({ error: 'Invalid image prompts from Groq' });
    }

    res.json({ character: data.character, prompts: data.prompts });
  } catch (error) {
    sendGroqError(res, error, 'Image prompt generation failed');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Story server running on http://localhost:${PORT}`);
  if (!isGroqConfigured()) {
    console.error(`\n❌ GROQ_API_KEY is not set!`);
    console.error(`   Add it to the .env file in the project root:`);
    console.error(`   GROQ_API_KEY=gsk_your_key_here\n`);
  } else {
    console.log(`✅ Server ready to accept requests\n`);
  }
});
