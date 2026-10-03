import React, { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import type { useStoryGenerator } from '../hooks/useStoryGenerator';
import { Panel } from './ui/Panel';
import { ProgressBar } from './ui/ProgressBar';
import { GameButton } from './ui/GameButton';
import { Dialog } from './ui/Dialog';

type Generator = ReturnType<typeof useStoryGenerator>;

/** Game-style loading screen while the story and its illustrations are created */
export const GenerationScreen: React.FC<{ generator: Generator }> = ({ generator }) => {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const {
    generationStep,
    generateImages,
    imagesGenerated,
    totalImages,
    modelDownloadProgress,
    pendingStory,
    imageGenerationError,
    showContinueWithoutImages
  } = generator;

  const storyDone = !!pendingStory && generationStep !== 'story';
  const paintingActive = generationStep === 'images';

  return (
    <Screen>
      <Panel>
        <Content>
          <BookIcon aria-hidden>
            📖
            <Sparkle style={{ top: '-6px', left: '-14px' }}>✨</Sparkle>
            <Sparkle style={{ top: '10px', right: '-18px', animationDelay: '0.6s' }}>⭐</Sparkle>
          </BookIcon>
          <Title>{t('generationTitle')}</Title>

          <Steps>
            <Step $state={storyDone ? 'done' : 'active'}>
              <StepBadge>{storyDone ? '✓' : '1'}</StepBadge>
              <span>✍️ {t('writingStory')}</span>
              {storyDone && (
                <GameButton $tone="paper" $size="sm" onClick={() => setShowPreview(true)}>
                  👀 {t('previewStory')}
                </GameButton>
              )}
            </Step>

            {generateImages && (
              <Step $state={paintingActive ? 'active' : storyDone && !imageGenerationError ? 'done' : 'waiting'}>
                <StepBadge>2</StepBadge>
                <span>
                  🎨 {t('paintingIllustrations')}
                  {totalImages > 0 && modelDownloadProgress === null && (
                    <> · {t('paintingProgress', { done: imagesGenerated, total: totalImages })}</>
                  )}
                </span>
              </Step>
            )}
          </Steps>

          {modelDownloadProgress !== null ? (
            <BarBlock>
              <BarLabel>{t('downloadingImageModel', { progress: Math.round(modelDownloadProgress) })}</BarLabel>
              <ProgressBar value={modelDownloadProgress} />
            </BarBlock>
          ) : paintingActive && totalImages > 0 ? (
            <BarBlock>
              <ProgressBar value={(imagesGenerated / totalImages) * 100} />
            </BarBlock>
          ) : null}
        </Content>
      </Panel>

      {showPreview && pendingStory && (
        <Dialog title={t('storyPreviewTitle')} icon="📖" onClose={() => setShowPreview(false)}>
          {pendingStory.pages.map((page, i) => (
            <PreviewParagraph key={i}>{page.paragraph}</PreviewParagraph>
          ))}
        </Dialog>
      )}

      {showContinueWithoutImages && imageGenerationError && (
        <Dialog
          title={t('imageErrorTitle')}
          icon="🎨"
          actions={
            <>
              <GameButton $tone="paper" onClick={generator.cancelStoryGeneration}>{t('cancel')}</GameButton>
              <GameButton $tone="leaf" onClick={generator.continueWithoutImages}>{t('continueWithoutImages')}</GameButton>
            </>
          }
        >
          <p>{imageGenerationError}</p>
          <p>{t('continueWithoutImagesQuestion')}</p>
        </Dialog>
      )}
    </Screen>
  );
};

const hop = keyframes`
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50% { transform: translateY(-18px) rotate(4deg); }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.15); }
`;

const Screen = styled.main`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 16px 16px 120px;

  > div {
    width: min(560px, 100%);
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
`;

const BookIcon = styled.div`
  position: relative;
  font-size: 5rem;
  line-height: 1;
  animation: ${hop} 1.4s ease-in-out infinite;
`;

const Sparkle = styled.span`
  position: absolute;
  font-size: 1.8rem;
  animation: ${twinkle} 1.2s ease-in-out infinite;
`;

const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 600;
`;

const Steps = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StepBadge = styled.span`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 700;
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 201, 60, 0.6); }
  50% { box-shadow: 0 0 0 8px rgba(255, 201, 60, 0); }
`;

const Step = styled.li<{ $state: 'waiting' | 'active' | 'done' }>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 14px;
  text-align: left;
  border-radius: 16px;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  background: ${({ $state }) => ($state === 'done' ? '#e6f9e9' : $state === 'active' ? '#fff6d6' : '#f2eff8')};
  opacity: ${({ $state }) => ($state === 'waiting' ? 0.6 : 1)};
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 500;

  > span:nth-child(2) {
    flex: 1;
  }

  ${StepBadge} {
    background: ${({ theme, $state }) => ($state === 'done' ? theme.colors.leaf : $state === 'active' ? theme.colors.sun : '#fff')};
    color: ${({ $state, theme }) => ($state === 'done' ? '#fff' : theme.colors.ink)};
    ${({ $state }) => $state === 'active' && css`animation: ${pulse} 1.5s ease-in-out infinite;`}
  }
`;

const BarBlock = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BarLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

const PreviewParagraph = styled.p`
  margin: 0 0 14px;
`;
