import { useState, useEffect } from 'react';
import { useTranslation } from './useTranslation';
import { imageService } from '../services/imageService';
import { storyService } from '../services/storyService';
import { deleteStory, loadStories, saveStory } from '../services/storyStorage';

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

export type TextServiceStatus = 'checking' | 'ready' | 'not_configured' | 'server_down';

export const useStoryGenerator = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [textServiceStatus, setTextServiceStatus] = useState<TextServiceStatus>('checking');
  const [currentStoryId, setCurrentStoryId] = useState<number | null>(null);
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
  const [generationStep, setGenerationStep] = useState<'story' | 'images' | null>(null);
  const [imagesGenerated, setImagesGenerated] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [pendingStory, setPendingStory] = useState<Story | null>(null);
  const [imageGenerationError, setImageGenerationError] = useState<string | null>(null);
  const [showContinueWithoutImages, setShowContinueWithoutImages] = useState(false);
  const [modelDownloadProgress, setModelDownloadProgress] = useState<number | null>(null);
  const [webGPUSupported, setWebGPUSupported] = useState<boolean | null>(null);
  
  const { language } = useTranslation();

  // Check that the story server is running with a Groq key, and whether WebGPU is available
  useEffect(() => {
    storyService.checkHealth()
      .then(configured => setTextServiceStatus(configured ? 'ready' : 'not_configured'))
      .catch(() => setTextServiceStatus('server_down'));
    imageService.isSupported().then(setWebGPUSupported);

    // Restore the bookshelf, keeping anything created while it was loading
    loadStories().then(saved => {
      setStories(prev => [...prev, ...saved.filter(story => !prev.some(p => p.id === story.id))]);
    });
  }, []);

  /** Put a finished story on the shelf and save it */
  const addStory = (story: Story) => {
    setStories(prev => [story, ...prev]);
    saveStory(story);
  };

  const removeStory = (id: number) => {
    setStories(prev => prev.filter(story => story.id !== id));
    if (currentStoryId === id) setCurrentStoryId(null);
    deleteStory(id);
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

  const generateImageForPage = async (
    imagePrompt: string,
    context: string | undefined,
    seed: number
  ): Promise<string> => {
    try {
      // Generate the image in the browser with runonweb Imagine
      return await imageService.generateImage(imagePrompt, context, seed);
    } catch (error: any) {
      console.error('Error generating image:', error);
      
      // These errors affect every page, so stop and let the user decide
      if (error.message === 'WEBGPU_UNSUPPORTED' || error.message === 'IMAGE_MODEL_LOAD_FAILED') {
        throw error;
      }
      
      return '';
    }
  };

  const imageErrorMessage = (code: string): string => {
    if (code === 'WEBGPU_UNSUPPORTED') {
      return 'Image generation needs WebGPU (a recent Chrome or Edge with a compatible GPU).';
    }
    if (code === 'IMAGE_MODEL_LOAD_FAILED') {
      return 'The image model could not be downloaded or initialized.';
    }
    return 'Failed to generate images.';
  };

  const generateStory = async () => {
    // Validate input based on mode
    if (advancedMode) {
      const hasAtLeastOneField = Object.values(formData).some(value => value.trim());
      if (!hasAtLeastOneField) {
        return; // Will be handled by UI validation
      }
    } else {
      if (!inputValue.trim() || textServiceStatus !== 'ready' || isLoading) return;
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
    setGenerationStep('story');
    setImagesGenerated(0);
    setTotalImages(0);

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

      // Llama models tend to add titles or preambles, which would break the paragraph split
      const outputFormat = language === 'es'
        ? 'Responde solo con los párrafos de la historia separados por una línea en blanco. Sin título, introducción ni notas.'
        : 'Respond with only the story paragraphs separated by a blank line. No title, introduction or notes.';
      const storyContent = await storyService.generateStory(prompt, `${systemInstruction}\n\n${outputFormat}`);

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

      // Store story temporarily - don't add to list until images are ready
      setPendingStory(newStory);

      // Generate images for each paragraph (only if enabled and not quota exceeded)
      if (generateImages) {
        // Step 2: Generate images
        setGenerationStep('images');
        setTotalImages(pages.length);
        setImagesGenerated(0);
        setImageGenerationError(null);
        setShowContinueWithoutImages(false);
        
        try {
          // Make sure the in-browser model is available and loaded (first run downloads the weights)
          if (!(await imageService.isSupported())) {
            throw new Error('WEBGPU_UNSUPPORTED');
          }
          setModelDownloadProgress(0);
          await imageService.ensureLoaded(setModelDownloadProgress);
          setModelDownloadProgress(null);

          // Short English scene prompts with a shared character description work far better
          // than raw paragraphs; fall back to the paragraphs if Groq can't produce them
          const scenePrompts = await storyService
            .generateImagePrompts(pages.map(page => page.paragraph))
            .catch(error => {
              console.warn('Falling back to paragraph image prompts:', error);
              return null;
            });

          // Extract character and theme information from the story
          const characterContext = extractCharacterContext(prompt, storyContent);
          // Same seed on every page keeps the illustrations more consistent
          const seed = Math.floor(Math.random() * 1_000_000_000);
          
          // Generate all images before showing the story
          const pagesWithImages: StoryPage[] = [];
          let hasError = false;
          let errorMessage = '';
          
          for (let i = 0; i < pages.length; i++) {
            try {
              const imageUrl = scenePrompts
                ? await generateImageForPage(scenePrompts[i], undefined, seed)
                : await generateImageForPage(
                    pages[i].paragraph,
                    characterContext
                      ? `${prompt} ${characterContext} Page ${i + 1} of ${pages.length}.`
                      : prompt,
                    seed
                  );
              
              pagesWithImages.push({
                ...pages[i],
                imageUrl: imageUrl || undefined
              });
              
              // Update progress
              setImagesGenerated(i + 1);
            } catch (error: any) {
              // generateImageForPage only throws errors that affect every page: stop and ask user
              hasError = true;
              errorMessage = imageErrorMessage(error.message);
              pagesWithImages.push(pages[i]); // Add page without image
              break;
            }
          }
          
          // If there was an error, show option to continue without images
          if (hasError) {
            setImageGenerationError(errorMessage);
            setShowContinueWithoutImages(true);
            // Don't proceed - wait for user decision
            return;
          }
          
          // Every page failed without a fatal error: let the user decide instead of silently showing no images
          if (!pagesWithImages.some(page => page.imageUrl)) {
            setImageGenerationError(imageErrorMessage(''));
            setShowContinueWithoutImages(true);
            return;
          }
          
          // The story isn't in the list yet, so attach the images before it's added below
          newStory.pages = pagesWithImages;
        } catch (error: any) {
          console.error('Error in image generation loop:', error);
          setModelDownloadProgress(null);
          setImageGenerationError(imageErrorMessage(error.message));
          setShowContinueWithoutImages(true);
          return;
        }
        
        // Reset step tracking
        setGenerationStep(null);
        setImagesGenerated(0);
        setTotalImages(0);
      } else {
        // If images are disabled, we can add story immediately but keep it in pending for preview
        // Reset steps after a brief moment to allow preview
        setTimeout(() => {
          addStory(newStory);
          setPendingStory(null);
          setCurrentStoryId(newStory.id);
          setGenerationStep(null);
          setImagesGenerated(0);
          setTotalImages(0);
        }, 500); // Small delay to show completion state
        return; // Exit early for non-image stories
      }
      
      // Add story to list and navigate only after images are generated
      addStory(newStory);
      setPendingStory(null);
      setCurrentStoryId(newStory.id);

    } catch (error: any) {
      console.error('Error generating story:', error);
      
      let errorMessage = 'Sorry, there was an error generating your story.';
      
      if (error.message === 'GROQ_RATE_LIMITED') {
        errorMessage = 'Groq rate limit reached. Please wait a moment and try again.';
        setQuotaError(errorMessage);
      } else if (error.message === 'GROQ_UNAUTHORIZED') {
        errorMessage = 'Groq API key is invalid. Please check GROQ_API_KEY in your .env file.';
      } else if (error.message === 'GROQ_NOT_CONFIGURED') {
        errorMessage = 'Groq API key is not set. Please add GROQ_API_KEY to your .env file and restart the server.';
        setTextServiceStatus('not_configured');
      } else if (error.message === 'PROXY_SERVER_NOT_RUNNING') {
        errorMessage = 'The story server is not running. Start it with "pnpm dev".';
        setTextServiceStatus('server_down');
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
      setGenerationStep(null);
      setImagesGenerated(0);
      setTotalImages(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateStory();
    }
  };

  const backToStories = () => {
    setCurrentStoryId(null);
  };

  const dismissQuotaError = () => {
    setQuotaError(null);
  };

  const continueWithoutImages = () => {
    if (pendingStory) {
      // Add story without images and proceed
      addStory(pendingStory);
      setPendingStory(null);
      setCurrentStoryId(pendingStory.id);
      setGenerationStep(null);
      setImagesGenerated(0);
      setTotalImages(0);
      setImageGenerationError(null);
      setShowContinueWithoutImages(false);
      setIsLoading(false);
    }
  };

  const cancelStoryGeneration = () => {
    // Cancel and remove pending story
    setPendingStory(null);
    setGenerationStep(null);
    setImagesGenerated(0);
    setTotalImages(0);
    setImageGenerationError(null);
    setShowContinueWithoutImages(false);
    setIsLoading(false);
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
    textServiceStatus,
    currentStoryId,
    generateImages,
    toddlerMode,
    quotaError,
    advancedMode,
    formData,
    generationStep,
    imagesGenerated,
    totalImages,
    pendingStory,
    imageGenerationError,
    showContinueWithoutImages,
    modelDownloadProgress,
    webGPUSupported,
    
    // Actions
    setInputValue,
    setGenerateImages,
    setToddlerMode,
    setCurrentStoryId,
    generateStory,
    handleKeyDown,
    backToStories,
    dismissQuotaError,
    setAdvancedMode,
    updateFormData,
    validateAdvancedForm,
    continueWithoutImages,
    removeStory,
    cancelStoryGeneration,
  };
};
