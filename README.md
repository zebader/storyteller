# 📚 Storyteller

An AI children's story generator. Enter a prompt (or fill in the guided form) and get a 5-page illustrated story you can read page by page and download as a PDF. Available in English and Spanish.

## How it works

- **Story text: [Groq](https://console.groq.com)**. The browser sends the prompt to a small Express server (`server/index.js`), which calls Groq. The API key stays on the server.
- **Illustrations: [runonweb Imagine](https://runonweb.ai/models/image)**. Images are generated **in the browser** with WebGPU (Bonsai Image 4B / FLUX.2 Klein, ternary "Quality" weights). It's free and needs no API key.
  - The first time you generate illustrations, about **3.9 GB** of model weights are downloaded and cached in the browser (IndexedDB). Later runs skip the download.
  - It requires a Chromium browser (Chrome or Edge) with WebGPU and a reasonably recent GPU. Each image takes about 10–40 s.
  - If WebGPU isn't available, you can still continue without images.

## Getting started

```bash
pnpm install
cp .env.example .env   # then set GROQ_API_KEY
pnpm dev               # starts the Groq server (:3001) and Vite (:3000)
```

Open http://localhost:3000. See [SETUP.md](SETUP.md) for configuration details, troubleshooting, and **deploying to Vercel for free**.

## Scripts

- `pnpm dev`: API server and Vite dev server together
- `pnpm start`: Vite dev server only
- `pnpm run server`: API server only
- `pnpm build`: type-check and production build (into `build/`)
- `pnpm preview`: serve the production build
- `pnpm test`: run tests with Vitest

## Project structure

```
server/storyApi.js             Story API (Groq calls, per-visitor rate limit), shared by:
server/index.js                  the local Express server (pnpm dev)
api/*.js                         the Vercel functions in production
src/components/AIChat.tsx      Main UI
src/hooks/useStoryGenerator.ts Story/image generation flow and state
src/services/storyService.ts   Client for the story server
src/services/imageService.ts   In-browser image generation (runonweb)
src/services/pdfService.ts     PDF export
src/translations/              English / Spanish copy
```

## Tech stack

React 19, TypeScript, Vite, styled-components, Express, groq-sdk, runonweb, jsPDF.
