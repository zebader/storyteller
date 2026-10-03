import { ImageGenerator, isImageGenerationSupported } from 'runonweb/image';

/**
 * Generates images in the browser with runonweb Imagine (Bonsai Image 4B / FLUX.2 Klein, WebGPU).
 * Uses the ternary "Quality" weights (~3.9 GB), downloaded once and cached in IndexedDB.
 * Returns data URLs so images work directly in <img> tags and in the PDF export.
 */
export class ImageService {
  private generator: ImageGenerator | null = null;
  private loadPromise: Promise<void> | null = null;
  private onLoadProgress: ((progress: number) => void) | null = null;

  /** Whether this browser has WebGPU (required, there is no fallback) */
  async isSupported(): Promise<boolean> {
    try {
      return await isImageGenerationSupported();
    } catch {
      return false;
    }
  }

  /**
   * Download (first time) and initialize the model.
   * @param onProgress Called with load progress from 0 to 100
   */
  async ensureLoaded(onProgress?: (progress: number) => void): Promise<void> {
    this.onLoadProgress = onProgress ?? null;

    if (!this.generator) {
      this.generator = new ImageGenerator({
        size: 'ternary',
        onProgress: (info) => {
          if (info.status.startsWith('loading')) {
            this.onLoadProgress?.(info.progress ?? 0);
          }
        }
      });
    }

    if (!this.loadPromise) {
      this.loadPromise = this.generator.load().catch((error) => {
        console.error('Error loading image model:', error);
        this.loadPromise = null;
        throw new Error('IMAGE_MODEL_LOAD_FAILED');
      });
    }

    try {
      await this.loadPromise;
    } finally {
      this.onLoadProgress = null;
    }
  }

  /**
   * Generate a children's-book illustration for a story paragraph
   * @param prompt The paragraph to illustrate
   * @param storyContext Optional story/character context for consistency
   * @param seed Shared seed across a story's pages for a more consistent look
   * @returns A data URL of the generated PNG
   */
  async generateImage(prompt: string, storyContext?: string, seed?: number): Promise<string> {
    if (!(await this.isSupported())) {
      throw new Error('WEBGPU_UNSUPPORTED');
    }

    await this.ensureLoaded();

    const { image } = await this.generator!.generate(this.buildPrompt(prompt, storyContext), {
      width: 512,
      height: 512,
      seed
    });

    return this.blobToDataUrl(image);
  }

  private buildPrompt(prompt: string, storyContext?: string): string {
    const parts = [
      prompt,
      storyContext ? `Context: ${storyContext}` : '',
      "Children's picture book illustration, soft watercolor and gouache, warm cheerful colors, cute expressive characters, clean composition, gentle lighting, highly detailed.",
      'No text, words or letters.'
    ];
    return parts.filter(Boolean).join('\n');
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
}

// Export a singleton instance
export const imageService = new ImageService();
