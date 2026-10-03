# Setup Guide

## Environment Variables

Copy `.env.example` to `.env` in the project root:

```env
# Groq API key for story generation (server-side only)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Groq model (defaults to openai/gpt-oss-120b)
GROQ_MODEL=openai/gpt-oss-120b

# Optional: API server port (defaults to 3001)
PORT=3001
```

`.env` is git-ignored. Image generation needs no keys, because it runs in the browser.

If you change `PORT`, also update the `/api` proxy target in `vite.config.ts`.

## Installation

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts the Express server on :3001 and the Vite dev server on :3000. Vite proxies `/api/*` to the Express server. To run them separately, use `pnpm run server` and `pnpm start` in two terminals.

## Getting a Groq API Key

1. Visit [console.groq.com/keys](https://console.groq.com/keys)
2. Sign in and click "Create API Key"
3. Paste it into `.env` as `GROQ_API_KEY` and restart the server

## Image Generation (runonweb Imagine)

- Runs locally in the browser with WebGPU. There's no server, API key or cost.
- First use downloads about 3.9 GB of weights. The app shows the download progress, and the weights are cached in IndexedDB for later runs. Clearing site data removes the cache.
- Requires Chrome or Edge with WebGPU support. Firefox and Safari support varies.

## Troubleshooting

### "The story server is not running"
Start it with `pnpm dev` or `pnpm run server`, and check that it's listening on http://localhost:3001.

### "Groq API key not configured"
Set `GROQ_API_KEY` in the root `.env` file and restart the server. The server logs `GROQ_API_KEY: ✅ Set` on startup when the key is set.

### "Image generation needs WebGPU"
Your browser or GPU doesn't support WebGPU. Use a recent Chrome or Edge, or continue without images.

### Rate limit errors
The Groq free tier has per-minute limits. Wait a moment and try again.
