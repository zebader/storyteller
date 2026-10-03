import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import type { useStoryGenerator } from '../hooks/useStoryGenerator';
import { Panel } from './ui/Panel';
import { ToggleChip } from './ui/ToggleChip';
import { StoryForm } from './StoryForm';
import { Bookshelf } from './Bookshelf';

type Generator = ReturnType<typeof useStoryGenerator>;

/** Logo, options, the create-story form and the bookshelf */
export const HomeScreen: React.FC<{ generator: Generator }> = ({ generator }) => {
  const { t, language, setLanguage } = useTranslation();
  const { textServiceStatus, isLoading } = generator;

  return (
    <Screen>
      <Header>
        <Logo>{t('logoTitle')}</Logo>
        <Tagline>{t('logoTagline')}</Tagline>
        <LanguageSwitch>
          <LangButton $active={language === 'es'} onClick={() => setLanguage('es')} aria-label="Español">🇪🇸</LangButton>
          <LangButton $active={language === 'en'} onClick={() => setLanguage('en')} aria-label="English">🇺🇸</LangButton>
        </LanguageSwitch>
      </Header>

      <Panel>
        {textServiceStatus !== 'ready' ? (
          <Status>
            <StatusIcon aria-hidden>{textServiceStatus === 'checking' ? '⏳' : '🔌'}</StatusIcon>
            {textServiceStatus === 'checking' && <p>{t('checkingServer')}</p>}
            {textServiceStatus === 'not_configured' && (
              <>
                <strong>{t('apiKeyNotFound')}</strong>
                <p>{t('apiKeyInstructions')}</p>
              </>
            )}
            {textServiceStatus === 'server_down' && (
              <>
                <strong>{t('serverDown')}</strong>
                <p>{t('serverDownInstructions')}</p>
              </>
            )}
          </Status>
        ) : (
          <>
            <PanelTitle>{t('createStoryTitle')}</PanelTitle>
            <Options>
              <ToggleChip
                id="generateImages"
                icon="🎨"
                label={t('generateIllustrations')}
                checked={generator.generateImages}
                disabled={isLoading}
                badge={generator.webGPUSupported === false ? t('webGPUUnsupported') : undefined}
                onChange={generator.setGenerateImages}
              />
              <ToggleChip
                id="toddlerMode"
                icon="🧸"
                label={t('toddlerMode')}
                checked={generator.toddlerMode}
                disabled={isLoading}
                onChange={generator.setToddlerMode}
              />
            </Options>
            {generator.generateImages && generator.webGPUSupported === false && (
              <Warning>⚠️ {t('webGPUUnsupported')}</Warning>
            )}
            <StoryForm {...generator} />
          </>
        )}
      </Panel>

      <Panel>
        <Bookshelf stories={generator.stories} onOpen={generator.setCurrentStoryId} onDelete={generator.removeStory} />
      </Panel>
    </Screen>
  );
};

const bounce = keyframes`
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
`;

const Screen = styled.main`
  position: relative;
  z-index: 1;
  width: min(860px, 100%);
  margin: 0 auto;
  padding: 24px 16px 140px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.header`
  position: relative;
  text-align: center;
  padding-top: 8px;
`;

const Logo = styled.h1`
  display: inline-block;
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(2.6rem, 8vw, 4.4rem);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.sun};
  letter-spacing: 0.02em;
  -webkit-text-stroke: 3px ${({ theme }) => theme.colors.outline};
  paint-order: stroke fill;
  text-shadow: 0 6px 0 ${({ theme }) => theme.colors.outline};
  animation: ${bounce} 4s ease-in-out infinite;
`;

const Tagline = styled.p`
  margin: 10px 0 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.15rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.ink};
`;

const LanguageSwitch = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 6px;

  @media (max-width: 600px) {
    position: static;
    justify-content: center;
    margin-top: 12px;
  }
`;

const LangButton = styled.button<{ $active: boolean }>`
  width: 46px;
  height: 46px;
  font-size: 1.4rem;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  background: ${({ theme, $active }) => ($active ? theme.colors.sun : theme.colors.panel)};
  box-shadow: 0 4px 0 rgba(61, 53, 87, ${({ $active }) => ($active ? 0.35 : 0.15)});
  opacity: ${({ $active }) => ($active ? 1 : 0.75)};
  transition: transform 0.12s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PanelTitle = styled.h2`
  margin: 0 0 14px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.6rem;
  font-weight: 600;
`;

const Options = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
`;

const Warning = styled.p`
  margin: -6px 0 16px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.berryDark};
`;

const Status = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.inkSoft};
  }
`;

const StatusIcon = styled.div`
  font-size: 3rem;
`;
