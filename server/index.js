const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  require('dotenv').config({ path: envPath });
  console.log('✅ Loaded .env file from:', envPath);
} else {
  console.warn('⚠️  .env file not found at:', envPath);
  console.warn('   Attempting to load from default location...');
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Log environment status on startup
const apiToken = process.env.HUGGINGFACE_API_TOKEN || process.env.REACT_APP_HUGGINGFACE_API_TOKEN;
console.log('\n📋 Environment Check:');
console.log('   HUGGINGFACE_API_TOKEN:', apiToken ? '✅ Set' : '❌ Not set');
if (process.env.REACT_APP_HUGGINGFACE_API_TOKEN && !process.env.HUGGINGFACE_API_TOKEN) {
  console.warn('   ⚠️  Using REACT_APP_HUGGINGFACE_API_TOKEN (consider using HUGGINGFACE_API_TOKEN for better security)');
}
console.log('   HUGGINGFACE_MODEL_ID:', process.env.HUGGINGFACE_MODEL_ID || process.env.REACT_APP_HUGGINGFACE_MODEL_ID || 'Using default (stabilityai/stable-diffusion-xl-base-1.0)');
console.log('   PORT:', PORT);
console.log('');

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Hugging Face Proxy' });
});

// Proxy endpoint for Hugging Face image generation
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, storyContext, modelId } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check for HUGGINGFACE_API_TOKEN (preferred) or REACT_APP_HUGGINGFACE_API_TOKEN (fallback)
    const apiToken = process.env.HUGGINGFACE_API_TOKEN || process.env.REACT_APP_HUGGINGFACE_API_TOKEN;
    if (!apiToken) {
      return res.status(500).json({ 
        error: 'HUGGINGFACE_API_TOKEN not configured on server',
        hint: 'Please add HUGGINGFACE_API_TOKEN (without REACT_APP_ prefix) to your .env file for security'
      });
    }

    // Use provided modelId or default (check both env var formats)
    const model = modelId || process.env.HUGGINGFACE_MODEL_ID || process.env.REACT_APP_HUGGINGFACE_MODEL_ID || 'stabilityai/stable-diffusion-xl-base-1.0';
    
    // Try multiple endpoint formats with fallback
    // The router endpoint format seems to vary, so we'll try the standard inference API first
    // If that gives 410, we'll try router endpoints
    const endpointFormats = [
      `https://api-inference.huggingface.co/models/${model}`,  // Standard endpoint
      `https://router.huggingface.co/models/${model}`,         // Router format 1
      `https://router.huggingface.co/hf-inference/models/${model}` // Router format 2
    ];
    
    let apiUrl = endpointFormats[0]; // Start with standard endpoint

    // Enhance the prompt with kid-friendly context and style consistency
    let enhancedPrompt = '';
    
    if (storyContext) {
      // Build a comprehensive prompt with character consistency
      enhancedPrompt = `Children's book illustration style, cartoon, 2D animation style, ${prompt}. 
Context: ${storyContext}
Style: Simple, colorful cartoon illustration perfect for 3-year-old children. Bright, cheerful colors, simple shapes, cute characters, friendly playful style. 
Art style: Children's book illustration, Pixar animation style, Disney cartoon style, flat design, vector art, clean lines, soft shadows, rounded shapes.
Character consistency: Maintain the exact same character appearance, colors, and style as described in the story context.
IMPORTANT: No text, words, letters, or written content. Purely visual illustration. No realistic or photographic elements.`;
    } else {
      enhancedPrompt = `Children's book illustration style, cartoon, 2D animation style, ${prompt}. 
Simple, colorful cartoon illustration perfect for 3-year-old children. Bright, cheerful colors, simple shapes, cute characters, friendly playful style. 
Art style: Children's book illustration, Pixar animation style, Disney cartoon style, flat design, vector art, clean lines, soft shadows, rounded shapes.
IMPORTANT: No text, words, letters, or written content. Purely visual illustration. No realistic or photographic elements.`;
    }

    const requestBody = {
      inputs: enhancedPrompt,
      parameters: {
        negative_prompt: "realistic, photorealistic, photograph, photo, 3D render, hyperrealistic, dark, scary, violent, text, words, letters, written content, blurry, low quality, duplicate, grainy, noise, oversaturated, adult themes, complex details, realistic textures, shadows, depth of field, bokeh, lens flare, camera artifacts, professional photography, DSLR, cinematic lighting, dramatic lighting, high contrast, dark shadows, black and white, monochrome, sketch, line art, unfinished, rough draft, watermark, signature, logo, brand",
        guidance_scale: 7.5,
        num_inference_steps: 30
      }
    };

    // Try endpoints with fallback mechanism
    let response;
    let errorText = '';
    let lastError = null;
    
    for (let i = 0; i < endpointFormats.length; i++) {
      apiUrl = endpointFormats[i];
      
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`
          },
          body: JSON.stringify(requestBody)
        });
        
        // If we get a successful response or a non-404/410 error, break
        if (response.ok || (response.status !== 404 && response.status !== 410)) {
          break;
        }
        
        // If 404 or 410, try next endpoint
        if (response.status === 404 || response.status === 410) {
          errorText = await response.text();
          lastError = { status: response.status, text: errorText };
          if (i < endpointFormats.length - 1) {
            console.log(`Endpoint ${i + 1} failed with ${response.status}, trying next...`);
            continue;
          }
        }
      } catch (fetchError) {
        lastError = { error: fetchError.message };
        if (i < endpointFormats.length - 1) {
          console.log(`Endpoint ${i + 1} failed with error, trying next...`);
          continue;
        }
        throw fetchError;
      }
    }

    if (!response || !response.ok) {
      errorText = errorText || (lastError?.text || lastError?.error || 'Unknown error');
      
      // Handle model loading (503)
      if (response && response.status === 503) {
        let estimatedTime = 20;
        try {
          const errorData = JSON.parse(errorText);
          estimatedTime = errorData.estimated_time || 20;
        } catch {
          // Use default if parsing fails
        }
        return res.status(503).json({ 
          error: 'MODEL_LOADING',
          estimated_time: estimatedTime 
        });
      }
      
      // Handle rate limiting
      if (response && response.status === 429) {
        return res.status(429).json({ error: 'HUGGINGFACE_QUOTA_EXCEEDED' });
      }
      
      // Handle unauthorized
      if (response && (response.status === 401 || response.status === 403)) {
        return res.status(401).json({ error: 'HUGGINGFACE_UNAUTHORIZED' });
      }
      
      // Handle 402 - Payment Required
      if (response && response.status === 402) {
        return res.status(402).json({ 
          error: 'HUGGINGFACE_PAYMENT_REQUIRED',
          details: errorText,
          hint: 'This model requires a paid Hugging Face subscription. Please upgrade your account or use a different model.'
        });
      }
      
      // Handle 404 - model not found or endpoint issue
      if (response && response.status === 404) {
        return res.status(404).json({ 
          error: `Model or endpoint not found (404)`,
          details: errorText,
          hint: `Tried endpoints: ${endpointFormats.join(', ')}. Model: ${model}. Please verify the model name is correct.`
        });
      }
      
      // Handle 410 - endpoint deprecated
      if (response && response.status === 410) {
        return res.status(410).json({ 
          error: `Endpoint deprecated (410)`,
          details: errorText,
          hint: 'The API endpoint format may have changed. Please check Hugging Face documentation.'
        });
      }
      
      return res.status(response?.status || 500).json({ 
        error: `Hugging Face API error: ${response?.status || 'Unknown'}`,
        details: errorText 
      });
    }

    // Get image as buffer
    const imageBuffer = await response.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';

    // Return base64 encoded image with data URL format
    res.json({
      image: `data:${contentType};base64,${imageBase64}`
    });

  } catch (error) {
    console.error('Error in proxy:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Hugging Face Proxy Server running on http://localhost:${PORT}`);
  const apiToken = process.env.HUGGINGFACE_API_TOKEN || process.env.REACT_APP_HUGGINGFACE_API_TOKEN;
  if (!apiToken) {
    console.error(`\n❌ ERROR: HUGGINGFACE_API_TOKEN is not set!`);
    console.error(`   Please add to your .env file in the root directory:`);
    console.error(`   HUGGINGFACE_API_TOKEN=hf_your_token_here\n`);
  } else {
    console.log(`✅ Server ready to accept requests\n`);
  }
});

