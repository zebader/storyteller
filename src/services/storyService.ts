/**
 * Generates story text with Groq via the local Express server.
 * The Groq API key lives on the server; the browser only talks to /api.
 */
export class StoryService {
  /**
   * Returns true when the server is up and has GROQ_API_KEY set,
   * false when it is up without a key, and throws PROXY_SERVER_NOT_RUNNING otherwise.
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
      const data = await response.json();
      return !!data.groqConfigured;
    } catch {
      throw new Error('PROXY_SERVER_NOT_RUNNING');
    }
  }

  async generateStory(prompt: string, systemInstruction: string): Promise<string> {
    let response: Response;
    try {
      response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction })
      });
    } catch {
      throw new Error('PROXY_SERVER_NOT_RUNNING');
    }

    const data = await response.json().catch(() => ({ error: 'Unknown error' }));

    if (!response.ok) {
      if (['GROQ_NOT_CONFIGURED', 'GROQ_UNAUTHORIZED', 'GROQ_RATE_LIMITED', 'TOO_MANY_STORIES'].includes(data.error)) {
        throw new Error(data.error);
      }
      throw new Error(data.message || data.error || `Story generation error: ${response.status}`);
    }

    if (!data.content) {
      throw new Error('No story content received from server');
    }

    return data.content;
  }

  /**
   * Turn story pages into short English scene prompts for the image model,
   * one per page, each repeating a shared character description.
   */
  async generateImagePrompts(pages: string[]): Promise<string[]> {
    const response = await fetch('/api/image-prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || data.error || `Image prompt error: ${response.status}`);
    }

    return data.prompts.map((prompt: string) => `${prompt}. Main character: ${data.character}`);
  }
}

export const storyService = new StoryService();
