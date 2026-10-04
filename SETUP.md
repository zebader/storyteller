# Setup Guide

## Environment Variables

Copy `.env.example` to `.env` in the project root:

```env
# Groq API key for story generation (server-side only)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Groq model (defaults to openai/gpt-oss-120b)
GROQ_MODEL=openai/gpt-oss-120b

# Optional: stories each visitor can create per hour (defaults to 15, 0 disables the limit)
STORIES_PER_HOUR=15

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

## Deploying to Vercel (free)

The frontend is a static Vite build and the API runs as Vercel functions (`api/*.js`), which share their code with the local Express server (`server/storyApi.js`). Image generation runs in each visitor's browser, so it costs nothing to host.

1. Push the project to a GitHub (or GitLab/Bitbucket) repository.
2. In [vercel.com/new](https://vercel.com/new), import the repository. `vercel.json` already sets the build (Vite, `pnpm build`, output in `build/`), so keep the defaults.
3. Under **Environment Variables**, add `GROQ_API_KEY` (and optionally `GROQ_MODEL` and `STORIES_PER_HOUR`).
4. Click **Deploy**. Every push to the main branch redeploys; other branches get preview URLs.

Notes:
- **Free plan:** Vercel's Hobby plan is for non-commercial use only.
- **Rate limit:** `STORIES_PER_HOUR` limits how many stories each visitor (by IP) can create, to protect your Groq quota. It's counted in memory per function instance, so on Vercel it's a best-effort guard, not an exact quota.
- **After changing env vars:** redeploy for them to take effect (Deployments → ⋯ → Redeploy).

## Troubleshooting

### "The story server is not running"
Start it with `pnpm dev` or `pnpm run server`, and check that it's listening on http://localhost:3001.

### "Groq API key not configured"
Set `GROQ_API_KEY` in the root `.env` file and restart the server. The server logs `GROQ_API_KEY: ✅ Set` on startup when the key is set.

### "Image generation needs WebGPU"
Your browser or GPU doesn't support WebGPU. Use a recent Chrome or Edge, or continue without images.

### Rate limit errors
The Groq free tier has per-minute limits. Wait a moment and try again.
