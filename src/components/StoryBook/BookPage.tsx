import React from 'react';
import styled, { css } from 'styled-components';
import type { Story } from '../../hooks/useStoryGenerator';
import { useTranslation } from '../../hooks/useTranslation';
import { GameButton } from '../ui/GameButton';

/**
 * What can appear on one side of the book.
 * Book positions ("index") run from -1 (cover) through 0..n-1 (story pages) to n (the end).
 */
export type Side = 'left' | 'right' | 'single';

const PAGE_EMOJIS = ['🌟', '🌈', '🌙', '🌸', '🎈', '🍀', '🦋', '⭐'];

interface PageContext {
  story: Story;
  onOpen: () => void;
  onReadAgain: () => void;
  onBack: () => void;
}

/**
 * Content for one side of the book at a given index, or null for "nothing here"
 * (the left side of the closed cover). `kind` picks the half's look.
 */
export const pageFor = (
  index: number,
  side: Side,
  ctx: PageContext
): { kind: 'paper' | 'cover'; node: React.ReactNode } | null => {
  const { story } = ctx;
  const last = story.pages.length;

  if (index < 0) {
    if (side === 'left') return null;
    return { kind: 'cover', node: <CoverPage story={story} onOpen={ctx.onOpen} /> };
  }

  if (index >= last) {
    if (side === 'left') return { kind: 'paper', node: <TheEndPage /> };
    if (side === 'right') return { kind: 'paper', node: <EndActions onReadAgain={ctx.onReadAgain} onBack={ctx.onBack} /> };
    return {
      kind: 'paper',
      node: (
        <SingleEnd>
          <TheEndPage />
          <EndActions onReadAgain={ctx.onReadAgain} onBack={ctx.onBack} />
        </SingleEnd>
      )
    };
  }

  if (side === 'left') return { kind: 'paper', node: <IllustrationPage story={story} index={index} /> };
  if (side === 'right') return { kind: 'paper', node: <TextPage story={story} index={index} /> };
  return { kind: 'paper', node: <CombinedPage story={story} index={index} /> };
};

/** One half of the book: the colored rim (book cover edge) with a paper or cover face inside */
export const BookHalf: React.FC<{
  side: Side;
  kind: 'paper' | 'cover' | 'blank';
  children?: React.ReactNode;
}> = ({ side, kind, children }) => (
  <Rim $side={side}>
    {kind === 'cover' ? children : <Paper $side={side}>{children}</Paper>}
  </Rim>
);

/* ---------- Page contents ---------- */

const CoverPage: React.FC<{ story: Story; onOpen: () => void }> = ({ story, onOpen }) => {
  const { t } = useTranslation();
  const coverImage = story.pages.find(page => page.imageUrl)?.imageUrl;

  return (
    <Cover>
      <CoverStitch>
        <CoverArt>
          {coverImage ? <img src={coverImage} alt="" /> : <span aria-hidden>📖</span>}
        </CoverArt>
        <CoverTitle>{story.prompt}</CoverTitle>
        <GameButton $tone="sun" onClick={onOpen}>{t('openBook')} ✨</GameButton>
      </CoverStitch>
    </Cover>
  );
};

const IllustrationPage: React.FC<{ story: Story; index: number }> = ({ story, index }) => {
  const { t } = useTranslation();
  const imageUrl = story.pages[index].imageUrl;

  return (
    <PageInner $center>
      {imageUrl ? (
        <Frame $tilt={index % 2 === 0 ? -1.5 : 1.2}>
          <img src={imageUrl} alt={t('bookIllustration', { page: index + 1 })} />
        </Frame>
      ) : (
        <EmojiArt aria-hidden>{PAGE_EMOJIS[index % PAGE_EMOJIS.length]}</EmojiArt>
      )}
      <PageNumber>{index * 2 + 1}</PageNumber>
    </PageInner>
  );
};

const TextPage: React.FC<{ story: Story; index: number }> = ({ story, index }) => (
  <PageInner>
    <Ornament aria-hidden>✦ ✦ ✦</Ornament>
    <StoryText>{story.pages[index].paragraph}</StoryText>
    <PageNumber>{index * 2 + 2}</PageNumber>
  </PageInner>
);

const CombinedPage: React.FC<{ story: Story; index: number }> = ({ story, index }) => {
  const { t } = useTranslation();
  const imageUrl = story.pages[index].imageUrl;

  return (
    <PageInner>
      {imageUrl ? (
        <Frame $tilt={-1} $compact>
          <img src={imageUrl} alt={t('bookIllustration', { page: index + 1 })} />
        </Frame>
      ) : (
        <Ornament aria-hidden>{PAGE_EMOJIS[index % PAGE_EMOJIS.length]}</Ornament>
      )}
      <StoryText>{story.pages[index].paragraph}</StoryText>
      <PageNumber>{index + 1}</PageNumber>
    </PageInner>
  );
};

const TheEndPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <PageInner $center>
      <EndTitle>{t('theEnd')}</EndTitle>
      <EmojiArt aria-hidden>🌟</EmojiArt>
    </PageInner>
  );
};

const EndActions: React.FC<{ onReadAgain: () => void; onBack: () => void }> = ({ onReadAgain, onBack }) => {
  const { t } = useTranslation();
  return (
    <PageInner $center>
      <Actions>
        <GameButton $tone="sky" onClick={onReadAgain}>🔁 {t('readAgain')}</GameButton>
        <GameButton $tone="leaf" onClick={onBack}>📚 {t('backToShelf')}</GameButton>
      </Actions>
    </PageInner>
  );
};

/* ---------- Styles ---------- */

const RIM = '12px';

const Rim = styled.div<{ $side: Side }>`
  position: absolute;
  inset: 0;
  display: flex;
  background: ${({ theme }) => theme.colors.cover};
  border: 3px solid ${({ theme }) => theme.colors.outline};
  ${({ $side }) => $side === 'left' && css`
    padding: ${RIM} 0 ${RIM} ${RIM};
    border-right: none;
    border-radius: 22px 0 0 22px;
  `}
  ${({ $side }) => $side === 'right' && css`
    padding: ${RIM} ${RIM} ${RIM} 0;
    border-left: none;
    border-radius: 0 22px 22px 0;
  `}
  ${({ $side }) => $side === 'single' && css`
    padding: ${RIM};
    border-radius: 22px;
  `}
`;

const Paper = styled.div<{ $side: Side }>`
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 15%, rgba(255, 255, 255, 0.7), transparent 40%),
    ${({ theme, $side }) =>
      $side === 'left'
        ? `linear-gradient(90deg, ${theme.colors.paper} 82%, ${theme.colors.paperShade} 100%)`
        : $side === 'right'
          ? `linear-gradient(270deg, ${theme.colors.paper} 82%, ${theme.colors.paperShade} 100%)`
          : theme.colors.paper};
  border-radius: ${({ $side }) => ($side === 'left' ? '12px 0 0 12px' : $side === 'right' ? '0 12px 12px 0' : '12px')};
  box-shadow: inset 0 0 0 2px rgba(61, 53, 87, 0.08);
`;

const PageInner = styled.div<{ $center?: boolean }>`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${({ $center }) => ($center ? 'center' : 'flex-start')};
  gap: 14px;
  padding: clamp(18px, 4%, 40px) clamp(18px, 7%, 56px) 48px;
  overflow-y: auto;
`;

const Frame = styled.div<{ $tilt: number; $compact?: boolean }>`
  width: ${({ $compact }) => ($compact ? 'min(75%, 300px)' : '88%')};
  max-height: ${({ $compact }) => ($compact ? '45%' : 'none')};
  aspect-ratio: 1;
  flex-shrink: 0;
  padding: 10px;
  background: #fff;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  border-radius: 14px;
  box-shadow: 0 8px 0 rgba(61, 53, 87, 0.18);
  transform: rotate(${({ $tilt }) => $tilt}deg);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const EmojiArt = styled.div`
  display: grid;
  place-items: center;
  width: 55%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, ${({ theme }) => theme.colors.paperShade} 100%);
  border: 3px dashed ${({ theme }) => theme.colors.paperShade};
  font-size: clamp(3rem, 8vw, 6rem);
`;

const Ornament = styled.div`
  color: ${({ theme }) => theme.colors.coverDark};
  font-size: 1.1rem;
  letter-spacing: 0.4em;
  flex-shrink: 0;
`;

const StoryText = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(1rem, 1.35vw, 1.2rem);
  line-height: 1.75;
  color: ${({ theme }) => theme.colors.ink};

  &::first-letter {
    float: left;
    margin: 6px 4px 0 0;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 3.4em;
    font-weight: 700;
    line-height: 0.8;
    color: ${({ theme }) => theme.colors.berry};
    text-shadow: 2px 2px 0 ${({ theme }) => theme.colors.outline};
  }
`;

const PageNumber = styled.div`
  position: absolute;
  bottom: 14px;
  left: 0;
  right: 0;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

const EndTitle = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.berry};
  text-shadow: 3px 3px 0 ${({ theme }) => theme.colors.outline};
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
`;

const SingleEnd = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 1fr auto;

  > div {
    position: relative;
    inset: auto;
  }
`;

const Cover = styled.div`
  flex: 1;
  display: flex;
  padding: 14px;
  border-radius: inherit;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.25), transparent 50%),
    ${({ theme }) => theme.colors.cover};
`;

const CoverStitch = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 24px;
  border: 3px dashed rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  text-align: center;
  overflow: hidden;
`;

const CoverArt = styled.div`
  display: grid;
  place-items: center;
  width: min(60%, 260px);
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.paper};
  border: 4px solid ${({ theme }) => theme.colors.outline};
  box-shadow: 0 8px 0 ${({ theme }) => theme.colors.coverDark};
  font-size: 5rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CoverTitle = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1.3rem, 2.4vw, 2rem);
  font-weight: 700;
  line-height: 1.2;
  color: #fff;
  text-shadow:
    -2px -2px 0 ${({ theme }) => theme.colors.outline},
    2px -2px 0 ${({ theme }) => theme.colors.outline},
    -2px 2px 0 ${({ theme }) => theme.colors.outline},
    2px 3px 0 ${({ theme }) => theme.colors.outline};
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &::first-letter {
    text-transform: uppercase;
  }
`;
