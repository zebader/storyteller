import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import { GlobalStyle } from './GlobalStyle';
import { LanguageProvider, useTranslation } from './hooks/useTranslation';
import { useStoryGenerator } from './hooks/useStoryGenerator';
import { SkyBackground } from './components/SkyBackground';
import { HomeScreen } from './components/HomeScreen';
import { GenerationScreen } from './components/GenerationScreen';
import { StoryBook } from './components/StoryBook/StoryBook';
import { Toast } from './components/ui/Toast';

const Screens: React.FC = () => {
  const { t } = useTranslation();
  const generator = useStoryGenerator();
  const currentStory = generator.stories.find(story => story.id === generator.currentStoryId);
  // pendingStory stays set until the story lands on the shelf (or the user cancels)
  const isGenerating = generator.isLoading || !!generator.pendingStory;

  return (
    <>
      <SkyBackground />
      {currentStory ? (
        <StoryBook key={currentStory.id} story={currentStory} onBack={generator.backToStories} />
      ) : isGenerating ? (
        <GenerationScreen generator={generator} />
      ) : (
        <HomeScreen generator={generator} />
      )}
      {generator.quotaError && (
        <Toast onClose={generator.dismissQuotaError}>
          {t('noticeTitle')} {generator.quotaError}
        </Toast>
      )}
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <LanguageProvider>
        <Screens />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
