import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTranslation } from './useTranslation';
import { imageService } from '../services/imageService';

export interface StoryPage {
  paragraph: string;
  imageUrl?: string;
  imagePrompt: string;
}

export interface Story {
  id: number;
  prompt: string;
  content: string;
  pages: StoryPage[];
  timestamp: Date;
}

export const useStoryGenerator = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);
  const [currentStoryId, setCurrentStoryId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [generateImages, setGenerateImages] = useState(false);
  const [toddlerMode, setToddlerMode] = useState(false);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [formData, setFormData] = useState({
    protagonist: '',
    goal: '',
    setting: '',
    problem: '',
    helper: '',
    ending: ''
  });
  
  const { language } = useTranslation();

  // Initialize AI with environment variable on component mount
  useEffect(() => {
    const envApiKey = process.env.REACT_APP_GOOGLE_AI_API_KEY;
    if (envApiKey && envApiKey !== 'your-api-key-here') {
      initializeAI(envApiKey);
    }
  }, []);

  const initializeAI = (key: string) => {
    if (key.trim()) {
      const ai = new GoogleGenerativeAI(key);
      setGenAI(ai);
      return true;
    }
    return false;
  };

  const extractCharacterContext = (prompt: string, storyContent: string): string => {
    // Extract character information from the prompt and story for consistency
    let characterInfo = '';
    let characterDescription = '';
    let characterName = '';
    
    // If using advanced mode, extract character details from form data
    if (advancedMode && formData.protagonist) {
      characterName = formData.protagonist.trim();
      characterInfo = `Main character name: ${characterName}. `;
    }
    
    // Extract character descriptions from the story content
    const storyLines = storyContent.split('\n').filter(line => line.trim());
    if (storyLines.length > 0) {
      // Look for character descriptions in the first few paragraphs
      const firstParagraph = storyLines[0];
      const firstParagraphs = storyLines.slice(0, 2).join(' ');
      
      // Try to extract character name
      const namePatterns = [
        /(?:There was|Once upon a time|In a|A|The)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
        /([A-Z][a-z]+)\s+(?:was|had|loved|wanted|decided)/,
        /(?:named|called)\s+([A-Z][a-z]+)/
      ];
      
      for (const pattern of namePatterns) {
        const match = firstParagraph.match(pattern);
        if (match && match[1]) {
          characterName = match[1].trim();
          break;
        }
      }
      
      // Extract physical descriptions
      const descriptionPatterns = [
        /(?:was|had)\s+([^.]{10,80}(?:hair|eyes|fur|color|wearing|dressed)[^.]{0,50})/i,
        /(?:with|had)\s+([^.]{10,80}(?:hair|eyes|fur|color|wearing|dressed)[^.]{0,50})/i
      ];
      
      for (const pattern of descriptionPatterns) {
        const match = firstParagraphs.match(pattern);
        if (match && match[1]) {
          characterDescription = match[1].trim();
          break;
        }
      }
    }
    
    // Build comprehensive character context
    if (characterName) {
      characterInfo += `Character name: ${characterName}. `;
    }
    if (characterDescription) {
      characterInfo += `Character appearance: ${characterDescription}. `;
    }
    
    // Add setting information if available
    if (advancedMode && formData.setting) {
      characterInfo += `Setting/environment: ${formData.setting}. `;
    }
    
    // Add color scheme consistency hint
    if (characterInfo) {
      characterInfo += `Maintain consistent character design, colors, and art style throughout all images. Same character should look identical in every scene.`;
    }
    
    return characterInfo;
  };

  const generateImageForParagraph = async (
    paragraph: string, 
    storyPrompt: string, 
    characterContext?: string,
    pageNumber?: number,
    totalPages?: number
  ): Promise<string> => {
    try {
      // Check if Hugging Face service is configured
      if (!imageService.isConfigured()) {
        throw new Error('HUGGINGFACE_NOT_CONFIGURED');
      }

      // Create enhanced context with character consistency
      const enhancedContext = characterContext 
        ? `${storyPrompt} ${characterContext} Page ${pageNumber} of ${totalPages}.`
        : storyPrompt;

      // Use Hugging Face service to generate image
      const imageUrl = await imageService.generateImage(paragraph, enhancedContext);
      
      if (!imageUrl) {
        throw new Error('No image data received from Hugging Face');
      }
      
      return imageUrl;
    } catch (error: any) {
      console.error('Error generating image with Hugging Face:', error);
      
      // Handle specific error types
      if (error.message === 'HUGGINGFACE_QUOTA_EXCEEDED') {
        setQuotaError('Hugging Face image generation quota exceeded. Images will be generated when quota resets.');
        throw new Error('QUOTA_EXCEEDED');
      }
      
      if (error.message === 'HUGGINGFACE_UNAUTHORIZED') {
        setQuotaError('Hugging Face API token is invalid or expired. Please check your API token.');
        throw new Error('UNAUTHORIZED');
      }
      
      if (error.message === 'HUGGINGFACE_NOT_CONFIGURED') {
        setQuotaError('Hugging Face API token not configured. Please add HUGGINGFACE_API_TOKEN to your server .env file.');
        throw new Error('NOT_CONFIGURED');
      }
      
      if (error.message === 'PROXY_SERVER_NOT_RUNNING') {
        setQuotaError('Proxy server is not running. Please start the server with "npm run server" or "npm run dev".');
        throw new Error('PROXY_SERVER_NOT_RUNNING');
      }
      
      return '';
    }
  };

  const generateStory = async () => {
    // Validate input based on mode
    if (advancedMode) {
      const hasAtLeastOneField = Object.values(formData).some(value => value.trim());
      if (!hasAtLeastOneField) {
        return; // Will be handled by UI validation
      }
    } else {
      if (!inputValue.trim() || !genAI || isLoading) return;
    }

    // Build prompt based on mode
    let prompt: string;
    if (advancedMode) {
      const parts = [];
      if (formData.protagonist.trim()) parts.push(`Protagonista: ${formData.protagonist.trim()}`);
      if (formData.goal.trim()) parts.push(`Objetivo: ${formData.goal.trim()}`);
      if (formData.setting.trim()) parts.push(`Lugar: ${formData.setting.trim()}`);
      if (formData.problem.trim()) parts.push(`Problema: ${formData.problem.trim()}`);
      if (formData.helper.trim()) parts.push(`Ayuda: ${formData.helper.trim()}`);
      if (formData.ending.trim()) parts.push(`Final: ${formData.ending.trim()}`);
      prompt = parts.join('. ');
    } else {
      prompt = inputValue;
      setInputValue('');
    }
    
    setIsLoading(true);

    try {
      const systemInstruction = toddlerMode
        ? (language === 'es'
          ? `Eres un narrador para niños de 3 años.

Reglas:
- Genera exactamente 5 párrafos.
- Cada párrafo con 1-2 oraciones MUY cortas (máx. 8-10 palabras).
- Usa palabras simples y cotidianas.
- Tiempo presente. Frases afirmativas.
- Tono tierno y calmado. Sin miedo ni violencia.
- Repite ideas clave. Usa onomatopeyas suaves ("toc toc", "plin").
- Un personaje principal y una acción clara por escena.
- Mantente fiel al prompt.
- Añade detalles sensoriales simples (colores, sonidos suaves).

Formato: historia completa con separaciones claras entre párrafos.`
          : `You are a storyteller for 3-year-old kids.

Rules:
- Generate exactly 5 paragraphs.
- Each paragraph has 1-2 VERY short sentences (max 8-10 words).
- Use very simple, everyday words.
- Present tense. Positive, calm tone.
- No fear or violence. Gentle and kind.
- Repeat key ideas. Use soft onomatopoeia ("knock knock", "plink").
- One main character and one clear action per scene.
- Stay faithful to the user's prompt.
- Add simple sensory details (soft sounds, bright colors).

Format your response as a complete story with clear paragraph breaks.`)
        : (language === 'es' 
        ? `Eres un maestro narrador. Tu rol es crear historias atractivas y bien estructuradas basadas en los prompts del usuario.

Reglas:
- Siempre genera exactamente 5 párrafos
- Cada párrafo debe tener 3-4 oraciones
- Crea narrativas convincentes con inicio, desarrollo y final claros
- Usa descripciones vívidas y personajes atractivos
- Haz que la historia fluya naturalmente de párrafo a párrafo
- Sé creativo e imaginativo mientras te mantienes fiel al prompt del usuario
- Escribe en un estilo narrativo apropiado para todas las edades
- Cada párrafo debe ser visualmente rico y descriptivo para ilustración

Formatea tu respuesta como una historia completa con separaciones claras entre párrafos.`
        : `You are a master storyteller. Your role is to create engaging, well-structured stories based on user prompts. 

Rules:
- Always generate exactly 5 paragraphs
- Each paragraph should be 3-4 sentences long
- Create compelling narratives with clear beginning, middle, and end
- Use vivid descriptions and engaging characters
- Make the story flow naturally from paragraph to paragraph
- Be creative and imaginative while staying true to the user's prompt
- Write in a narrative style that's suitable for all ages
- Each paragraph should be visually rich and descriptive for illustration

Format your response as a complete story with clear paragraph breaks.`);

      const model = genAI!.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const storyContent = response.text();

      // Split story into paragraphs
      const paragraphs = storyContent.split('\n\n').filter(p => p.trim().length > 0);
      
      // Create story pages with empty image URLs initially
      const pages: StoryPage[] = paragraphs.slice(0, 5).map(paragraph => ({
        paragraph: paragraph.trim(),
        imageUrl: undefined,
        imagePrompt: paragraph.trim()
      }));

      const newStory: Story = {
        id: Date.now(),
        prompt: prompt,
        content: storyContent,
        pages: pages,
        timestamp: new Date()
      };

      setStories(prev => [newStory, ...prev]);
      setCurrentStoryId(newStory.id);
      setCurrentPage(0);

      // Generate images for each paragraph (only if enabled and not quota exceeded)
      if (generateImages) {
        try {
          // Extract character and theme information from the story
          const characterContext = extractCharacterContext(prompt, storyContent);
          
          for (let i = 0; i < pages.length; i++) {
            try {
              const imageUrl = await generateImageForParagraph(
                pages[i].paragraph, 
                prompt, 
                characterContext,
                i + 1,
                pages.length
              );
              if (imageUrl) {
                setStories(prev => prev.map(story => 
                  story.id === newStory.id 
                    ? {
                        ...story,
                        pages: story.pages.map((page, index) => 
                          index === i ? { ...page, imageUrl } : page
                        )
                      }
                    : story
                ));
              }
            } catch (error: any) {
              if (error.message === 'QUOTA_EXCEEDED') {
                // Stop generating more images if quota is exceeded
                break;
              }
            }
          }
        } catch (error) {
          console.error('Error in image generation loop:', error);
        }
      }

    } catch (error: any) {
      console.error('Error generating story:', error);
      
      let errorMessage = 'Sorry, there was an error generating your story.';
      
      if (error.message && error.message.includes('quota')) {
        errorMessage = `🚨 Quota Exceeded: Your Google Cloud project needs billing enabled.
        
To fix this:
1. Go to Google Cloud Console
2. Enable billing for your project
3. Wait 24-48 hours for changes to take effect
4. Or create a new project with billing enabled

This is a common issue with the free tier.`;
        setQuotaError('API quota exceeded. Please enable billing in Google Cloud Console.');
      }
      
      const errorStory: Story = {
        id: Date.now(),
        prompt: prompt,
        content: errorMessage,
        pages: [],
        timestamp: new Date()
      };
      setStories(prev => [errorStory, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateStory();
    }
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const nextPage = () => {
    const currentStory = stories.find(s => s.id === currentStoryId);
    if (currentStory && currentPage < currentStory.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const backToStories = () => {
    setCurrentStoryId(null);
    setCurrentPage(0);
  };

  const dismissQuotaError = () => {
    setQuotaError(null);
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateAdvancedForm = () => {
    return Object.values(formData).some(value => value.trim());
  };

  return {
    // State
    stories,
    inputValue,
    isLoading,
    genAI,
    currentStoryId,
    currentPage,
    generateImages,
    toddlerMode,
    quotaError,
    advancedMode,
    formData,
    
    // Actions
    setInputValue,
    setGenerateImages,
    setToddlerMode,
    setCurrentStoryId,
    setCurrentPage,
    generateStory,
    handleKeyDown,
    goToPage,
    nextPage,
    prevPage,
    backToStories,
    dismissQuotaError,
    setAdvancedMode,
    updateFormData,
    validateAdvancedForm,
  };
};
