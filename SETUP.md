# Setup Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Google AI API Key (for story generation)
REACT_APP_GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# Hugging Face API Token (for image generation)
# This should be set in the server/.env file, not here
# Get your token from: https://huggingface.co/settings/tokens
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Hugging Face Model ID (defaults to stabilityai/stable-diffusion-xl-base-1.0)
HUGGINGFACE_MODEL_ID=stabilityai/stable-diffusion-xl-base-1.0

# Optional: Proxy server URL (defaults to http://localhost:3001)
REACT_APP_PROXY_URL=http://localhost:3001

# Optional: Server port (defaults to 3001)
PORT=3001
```

**Important:** The `HUGGINGFACE_API_TOKEN` should be in the root `.env` file (not in `server/.env`) because the server reads from the root `.env` file using `dotenv`.

## Installation

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Set up your `.env` file with the API keys (see above)

3. Start the development servers:
```bash
# Option 1: Run both server and React app together
npm run dev

# Option 2: Run them separately (in two terminals)
# Terminal 1:
npm run server

# Terminal 2:
npm start
```

## Getting API Keys

### Google AI API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Hugging Face API Token
1. Visit [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Sign in or create an account
3. Click "New token"
4. Give it a name and select "Read" access
5. Copy the generated token (starts with `hf_`)

## Troubleshooting

### CORS Errors
If you see CORS errors, make sure the proxy server is running on port 3001. The React app calls the proxy server, which then calls Hugging Face API (avoiding CORS issues).

### Proxy Server Not Running
If you get "Proxy server is not running" error:
- Make sure you've run `npm run server` or `npm run dev`
- Check that the server is running on `http://localhost:3001`
- Verify the `HUGGINGFACE_API_TOKEN` is set in your `.env` file

### Model Loading (503 Error)
Some Hugging Face models need to be loaded first. The app will automatically retry after the estimated wait time.

