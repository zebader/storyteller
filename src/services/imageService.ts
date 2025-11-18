/**
 * Generates an image using the Hugging Face Inference API via a backend proxy.
 * Returns a data URL that can be used directly in img src attributes.
 */
export class ImageService {
  private proxyUrl: string;
  private modelId: string;

  constructor() {
    // Use proxy server URL (defaults to localhost:3001 in development)
    this.proxyUrl = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001';
    // Using a reliable text-to-image model - can be changed via env variable
    this.modelId = process.env.REACT_APP_HUGGINGFACE_MODEL_ID || 'stabilityai/stable-diffusion-xl-base-1.0';
  }

  /**
   * Generate an image using Hugging Face Inference API via backend proxy
   * @param prompt The text prompt to generate the image from
   * @param storyContext Optional context about the story for better consistency
   * @returns A Promise that resolves with a data URL string of the generated image
   */
  async generateImage(prompt: string, storyContext?: string): Promise<string | null> {
    try {
      // Make request to local proxy server
      const response = await fetch(`${this.proxyUrl}/api/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          storyContext,
          modelId: this.modelId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        // Handle model loading (503) - retry after a delay
        if (response.status === 503 && errorData.error === 'MODEL_LOADING') {
          const estimatedTime = errorData.estimated_time || 20;
          // Wait and retry once
          await new Promise(resolve => setTimeout(resolve, estimatedTime * 1000));
          return this.generateImage(prompt, storyContext);
        }
        
        // Handle rate limiting
        if (response.status === 429 || errorData.error === 'HUGGINGFACE_QUOTA_EXCEEDED') {
          throw new Error('HUGGINGFACE_QUOTA_EXCEEDED');
        }
        
        // Handle unauthorized
        if (response.status === 401 || errorData.error === 'HUGGINGFACE_UNAUTHORIZED') {
          throw new Error('HUGGINGFACE_UNAUTHORIZED');
        }
        
        // Handle proxy server not configured
        if (response.status === 500 && errorData.error?.includes('not configured')) {
          throw new Error('HUGGINGFACE_NOT_CONFIGURED');
        }
        
        throw new Error(`Image generation error: ${errorData.error || response.status}`);
      }

      // The proxy returns the image as a data URL
      const data = await response.json();
      
      if (!data.image) {
        throw new Error('No image data received from proxy server');
      }
      
      return data.image;

    } catch (error: any) {
      console.error('Error generating image with Hugging Face:', error);
      
      // Handle network errors (proxy server not running)
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        throw new Error('PROXY_SERVER_NOT_RUNNING');
      }
      
      // Check for specific error types
      if (error.message === 'HUGGINGFACE_QUOTA_EXCEEDED') {
        throw new Error('HUGGINGFACE_QUOTA_EXCEEDED');
      }
      
      if (error.message === 'HUGGINGFACE_UNAUTHORIZED') {
        throw new Error('HUGGINGFACE_UNAUTHORIZED');
      }
      
      if (error.message === 'HUGGINGFACE_NOT_CONFIGURED') {
        throw new Error('HUGGINGFACE_NOT_CONFIGURED');
      }
      
      throw error;
    }
  }

  /**
   * Check if the service is properly configured
   * Note: The actual API token is stored on the server, so we just check if proxy URL is set
   */
  isConfigured(): boolean {
    return !!this.proxyUrl;
  }

  /**
   * Get service status information
   */
  getStatus(): { configured: boolean; service: string } {
    return {
      configured: this.isConfigured(),
      service: `Hugging Face (${this.modelId})`
    };
  }
}

// Export a singleton instance
export const imageService = new ImageService();
