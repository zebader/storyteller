interface FreepikGeminiRequest {
  prompt: string;
  reference_images?: string[];
  webhook_url?: string;
}

interface FreepikGeminiResponse {
  data: {
    generated: string[];
    task_id: string;
    status: string;
  };
}

export class ImageService {
  private apiKey: string;
  private baseUrl = 'https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview';

  constructor() {
    this.apiKey = process.env.REACT_APP_FREEPIK_API_KEY || '';
    if (!this.apiKey) {
      console.warn('FREEPIK_API_KEY not found in environment variables');
    }
  }

  /**
   * Generate an image using Freepik's Gemini 2.5 Flash model
   */
  async generateImage(prompt: string, storyContext?: string): Promise<string | null> {
    if (!this.apiKey) {
      throw new Error('Freepik API key not configured');
    }

    try {
      // Enhance the prompt with kid-friendly context for 3-year-olds
      const enhancedPrompt = storyContext 
        ? `${prompt}. Context: This is part of a children's story about "${storyContext}". Create a simple, colorful cartoon illustration perfect for 3-year-old children. Use bright, cheerful colors, simple shapes, cute characters, and a friendly, playful style. Make it look like a children's book illustration. IMPORTANT: Do not include any text, words, letters, or written content in the image. The illustration should be purely visual without any text elements. Maintain consistent character appearance and style throughout the story.`
        : `${prompt}. Create a simple, colorful cartoon illustration perfect for 3-year-old children. Use bright, cheerful colors, simple shapes, cute characters, and a friendly, playful style. Make it look like a children's book illustration. IMPORTANT: Do not include any text, words, letters, or written content in the image. The illustration should be purely visual without any text elements.`;

      const requestBody: FreepikGeminiRequest = {
        prompt: enhancedPrompt
      };

      // Create the task
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-freepik-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Freepik API error: ${response.status} - ${errorText}`);
      }

      const data: FreepikGeminiResponse = await response.json();
      
      if (!data.data.task_id) {
        throw new Error('No task ID received from Freepik API');
      }

      // Poll for completion
      const imageUrl = await this.pollForCompletion(data.data.task_id);
      return imageUrl;

    } catch (error: any) {
      console.error('Error generating image with Freepik Gemini:', error);
      
      // Check for specific error types
      if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new Error('FREEPIK_QUOTA_EXCEEDED');
      }
      
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        throw new Error('FREEPIK_UNAUTHORIZED');
      }
      
      throw error;
    }
  }

  /**
   * Poll for task completion
   */
  private async pollForCompletion(taskId: string): Promise<string | null> {
    const maxAttempts = 30; // 30 attempts
    const delay = 2000; // 2 seconds between attempts
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/${taskId}`, {
          method: 'GET',
          headers: {
            'x-freepik-api-key': this.apiKey
          }
        });

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }

        const data: FreepikGeminiResponse = await response.json();
        
        if (data.data.status === 'COMPLETED' && data.data.generated && data.data.generated.length > 0) {
          // Return the first generated image URL
          return data.data.generated[0];
        }
        
        if (data.data.status === 'FAILED') {
          throw new Error('Image generation failed');
        }
        
        // Still processing, wait and try again
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error: any) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Image generation timeout');
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your-freepik-api-key-here';
  }

  /**
   * Get service status information
   */
  getStatus(): { configured: boolean; service: string } {
    return {
      configured: this.isConfigured(),
      service: 'Freepik Gemini 2.5 Flash'
    };
  }
}

// Export a singleton instance
export const imageService = new ImageService();
