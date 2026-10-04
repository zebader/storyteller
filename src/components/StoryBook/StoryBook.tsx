import React, { useState } from 'react';
import styled, { css, keyframes, ThemeProvider } from 'styled-components';
import type { Story } from '../../hooks/useStoryGenerator';
import { useTranslation } from '../../hooks/useTranslation';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { pdfService } from '../../services/pdfService';
import { GameButton } from '../ui/GameButton';
import { BookHalf, pageFor, type Side } from './BookPage';
import { FLIP_MS, useBookNavigation } from './useBookNavigation';
import { withBookColors } from '../bookColors';

interface StoryBookProps {
  story: Story;
  onBack: () => void;
}

/**
 * Reads a story as a book: a cover, one spread per story page (illustration left, text right)
 * and an end page. On wide screens pages turn with a 3D flip around the spine;
 * on narrow screens it shows one page at a time.
 */
export const StoryBook: React.FC<StoryBookProps> = ({ story, onBack }) => {
  const { t } = useTranslation();
  const isSpread = useMediaQuery(`(min-width: 900px)`);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const lastIndex = story.pages.length;
  const { index, flip, goTo, next, prev, finishFlip, swipeHandlers } = useBookNavigation({
    first: -1,
    last: lastIndex,
    animate: !reducedMotion
  });

  const ctx = { story, onOpen: next, onReadAgain: () => goTo(-1), onBack };

  const half = (position: number, side: Side) => {
    const page = pageFor(position, side, ctx);
    return page && <BookHalf side={side} kind={page.kind}>{page.node}</BookHalf>;
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      await pdfService.generateStoryPDF(story);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // While a page turns, the halves underneath already show what the turn reveals
  let leftUnder: React.ReactNode = null;
  let rightUnder: React.ReactNode = null;
  let leafFront: React.ReactNode = null;
  let leafBack: React.ReactNode = null;

  if (isSpread) {
    if (!flip) {
      leftUnder = half(index, 'left');
      rightUnder = half(index, 'right');
    } else if (flip.direction === 'next') {
      leftUnder = half(flip.from, 'left');
      rightUnder = half(flip.to, 'right');
      leafFront = half(flip.from, 'right');
      leafBack = half(flip.to, 'left');
    } else {
      leftUnder = half(flip.to, 'left');
      rightUnder = half(flip.from, 'right');
      leafFront = half(flip.from, 'left');
      leafBack = half(flip.to, 'right');
    }
  } else if (!flip) {
    rightUnder = half(index, 'single');
  } else {
    // Single page: turning forward lifts the current page away; turning back lays the previous one down
    rightUnder = half(flip.direction === 'next' ? flip.to : flip.from, 'single');
    leafFront = half(flip.direction === 'next' ? flip.from : flip.to, 'single');
    leafBack = <BookHalf side="single" kind="blank" />;
  }

  const shownIndex = flip ? flip.to : index;
  const closed = isSpread && shownIndex < 0;
  const leafMode = isSpread ? flip?.direction : flip && (flip.direction === 'next' ? 'single-next' : 'single-prev');
  const onStoryPage = shownIndex >= 0 && shownIndex < lastIndex;

  return (
    // The book uses this story's own cover color, matching its spine on the shelf
    <ThemeProvider theme={withBookColors(story.id)}>
      <Screen>
        <TopBar>
          <GameButton $tone="paper" $size="sm" onClick={onBack}>🏠 {t('backToShelf')}</GameButton>
          <Title title={story.prompt}>{story.prompt}</Title>
          <GameButton $tone="leaf" $size="sm" onClick={handleDownloadPDF} disabled={isDownloadingPDF}>
            {isDownloadingPDF ? t('downloadingPDF') : t('downloadPDF')}
          </GameButton>
        </TopBar>

        <Stage {...swipeHandlers}>
          <Book $spread={isSpread} $closed={closed}>
            {isSpread ? (
              <>
                <HalfSlot $side="left">{leftUnder}</HalfSlot>
                <HalfSlot $side="right">{rightUnder}</HalfSlot>
                {!closed && <Spine />}
                {!closed && <Ribbon />}
              </>
            ) : (
              <HalfSlot $side="single">{rightUnder}</HalfSlot>
            )}

            {flip && leafMode && (
              <Leaf
                $mode={leafMode}
                data-testid="page-leaf"
                onAnimationEnd={(e) => e.target === e.currentTarget && finishFlip()}
              >
                <Face $side={leafSide(leafMode, 'front')}>{leafFront}<Shade /></Face>
                <Face $side={leafSide(leafMode, 'back')} $back>{leafBack}<Shade /></Face>
              </Leaf>
            )}

            {isSpread && !flip && index > -1 && (
              <EdgeZone $side="left" onClick={prev} aria-label={t('previousPage')} />
            )}
            {isSpread && !flip && index > -1 && index < lastIndex && (
              <EdgeZone $side="right" onClick={next} aria-label={t('nextPage')} />
            )}
          </Book>
        </Stage>

        <BottomBar>
          <GameButton $tone="sky" $round onClick={prev} disabled={!!flip || index <= -1} aria-label={t('previousPage')}>
            ◀
          </GameButton>
          <Dots>
            {story.pages.map((_, i) => (
              <Dot
                key={i}
                $active={onStoryPage && shownIndex === i}
                onClick={() => goTo(i)}
                disabled={!!flip}
                aria-label={t('pageInfo', { current: i + 1, total: story.pages.length })}
              />
            ))}
          </Dots>
          <GameButton $tone="sky" $round onClick={next} disabled={!!flip || index >= lastIndex} aria-label={t('nextPage')}>
            ▶
          </GameButton>
        </BottomBar>
      </Screen>
    </ThemeProvider>
  );
};

type LeafMode = 'next' | 'prev' | 'single-next' | 'single-prev';

const leafSide = (mode: LeafMode, face: 'front' | 'back'): Side => {
  if (mode === 'next') return face === 'front' ? 'right' : 'left';
  if (mode === 'prev') return face === 'front' ? 'left' : 'right';
  return 'single';
};

/* ---------- Styles ---------- */

const EASE = 'cubic-bezier(0.645, 0.045, 0.355, 1)';

const turnNext = keyframes`
  from { transform: rotateY(0deg); }
  to { transform: rotateY(-180deg); }
`;

const turnPrev = keyframes`
  from { transform: rotateY(0deg); }
  to { transform: rotateY(180deg); }
`;

const layDown = keyframes`
  from { transform: rotateY(-180deg); }
  to { transform: rotateY(0deg); }
`;

const shadePulse = keyframes`
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
`;

const Screen = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
`;

const TopBar = styled.div`
  width: min(1100px, 100%);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h1`
  flex: 1;
  min-width: 0;
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1rem, 2.2vw, 1.4rem);
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colors.ink};

  /* Too narrow to be useful on phones; the cover already shows it */
  @media (max-width: 480px) {
    visibility: hidden;
  }
`;

const Stage = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: pan-y;
`;

const Book = styled.div<{ $spread: boolean; $closed: boolean }>`
  position: relative;
  perspective: 2400px;
  filter: drop-shadow(0 24px 30px rgba(61, 53, 87, 0.3));
  transition: transform ${FLIP_MS}ms ${EASE};
  ${({ $spread, $closed }) => $spread
    ? css`
      width: min(1100px, 94vw, calc((100dvh - 200px) * 1.5));
      aspect-ratio: 1.5;
      /* A closed book only has its right half: shift it so the cover sits in the middle */
      transform: translateX(${$closed ? '-25%' : '0'});
    `
    : css`
      width: min(560px, 100%);
      height: min(calc(100dvh - 190px), 820px);
      min-height: 420px;
    `}
`;

const HalfSlot = styled.div<{ $side: Side }>`
  position: absolute;
  top: 0;
  bottom: 0;
  ${({ $side }) => ($side === 'left' ? 'left: 0; right: 50%;' : $side === 'right' ? 'left: 50%; right: 0;' : 'left: 0; right: 0;')}
`;

const Spine = styled.div`
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 50%;
  width: 40px;
  transform: translateX(-50%);
  pointer-events: none;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(61, 53, 87, 0.18) 40%,
    rgba(61, 53, 87, 0.3) 50%,
    rgba(61, 53, 87, 0.18) 60%,
    transparent 100%
  );
`;

const Ribbon = styled.div`
  position: absolute;
  top: -4px;
  right: 9%;
  width: 26px;
  height: 64px;
  background: ${({ theme }) => theme.colors.ribbon};
  border: 3px solid ${({ theme }) => theme.colors.outline};
  border-top: none;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%);
  pointer-events: none;
`;

const Leaf = styled.div<{ $mode: LeafMode }>`
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 5;
  transform-style: preserve-3d;
  animation-duration: ${FLIP_MS}ms;
  animation-timing-function: ${EASE};
  animation-fill-mode: forwards;
  ${({ $mode }) => {
    switch ($mode) {
      case 'next':
        return css`left: 50%; right: 0; transform-origin: left center; animation-name: ${turnNext};`;
      case 'prev':
        return css`left: 0; right: 50%; transform-origin: right center; animation-name: ${turnPrev};`;
      case 'single-next':
        return css`left: 0; right: 0; transform-origin: left center; animation-name: ${turnNext};`;
      case 'single-prev':
        return css`left: 0; right: 0; transform-origin: left center; animation-name: ${layDown};`;
    }
  }}
`;

const Face = styled.div<{ $side: Side; $back?: boolean }>`
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
  border-radius: ${({ $side }) => ($side === 'left' ? '22px 0 0 22px' : $side === 'right' ? '0 22px 22px 0' : '22px')};
  ${({ $back }) => $back && css`transform: rotateY(180deg);`}
`;

// Darkens the turning page as it lifts, then fades as it lands
const Shade = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(61, 53, 87, 0.28), rgba(61, 53, 87, 0.05) 60%, rgba(255, 255, 255, 0.1));
  opacity: 0;
  animation: ${shadePulse} ${FLIP_MS}ms ${EASE};
`;

const EdgeZone = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 0;
  bottom: 0;
  ${({ $side }) => ($side === 'left' ? 'left: 0;' : 'right: 0;')}
  width: 56px;
  z-index: 4;
  border: none;
  background: transparent;
  cursor: pointer;

  /* A folded corner appears on hover to hint that the page can be turned */
  &::after {
    content: '';
    position: absolute;
    bottom: 12px;
    ${({ $side }) => ($side === 'left' ? 'left: 12px;' : 'right: 12px;')}
    width: 0;
    height: 0;
    background: ${({ $side, theme }) =>
      `linear-gradient(${$side === 'left' ? '45deg' : '-45deg'}, ${theme.colors.paperShade} 50%, transparent 50%)`};
    box-shadow: 0 0 8px rgba(61, 53, 87, 0.25);
    border-radius: ${({ $side }) => ($side === 'left' ? '0 0 0 8px' : '0 0 8px 0')};
    transition: width 0.2s ease, height 0.2s ease;
  }

  &:hover::after,
  &:focus-visible::after {
    width: 44px;
    height: 44px;
  }
`;

const BottomBar = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const Dots = styled.div`
  display: flex;
  gap: 10px;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? '30px' : '16px')};
  height: 16px;
  padding: 0;
  border-radius: 999px;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  background: ${({ theme, $active }) => ($active ? theme.colors.sun : theme.colors.panel)};
  transition: width 0.25s ease, background 0.25s ease;
`;
