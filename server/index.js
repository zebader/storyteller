import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateStory, getGroqModel, health, imagePrompts, isGroqConfigured } from './storyApi.js';

// Local development server. In production the same API runs as Vercel functions (api/*.js).

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

console.log('\n📋 Environment Check:');
console.log('   GROQ_API_KEY:', isGroqConfigured() ? '✅ Set' : '❌ Not set');
console.log('   GROQ_MODEL:', getGroqModel());
console.log('   PORT:', PORT);
console.log('');

app.use(cors());
app.use(express.json());

const send = (res, result) => res.status(result.status).json(result.body);

app.get('/api/health', (req, res) => send(res, health()));
app.post('/api/generate-story', async (req, res) => send(res, await generateStory(req.body, req.ip)));
app.post('/api/image-prompts', async (req, res) => send(res, await imagePrompts(req.body, req.ip)));

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
