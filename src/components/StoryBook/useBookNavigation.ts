import { useCallback, useEffect, useRef, useState } from 'react';

/** Duration of one page turn; keep in sync with the leaf animation in StoryBook */
export const FLIP_MS = 800;

export interface Flip {
  from: number;
  to: number;
  direction: 'next' | 'prev';
}

interface Options {
  /** First book position (the cover) */
  first: number;
  /** Last book position (the end page) */
  last: number;
  /** False skips the turning animation (reduced motion) */
  animate: boolean;
}

/**
 * Page state for the book: which position is showing, the page turn in progress,
 * and keyboard (← →) and swipe controls.
 */
export const useBookNavigation = ({ first, last, animate }: Options) => {
  const [index, setIndex] = useState(first);
  const [flip, setFlip] = useState<Flip | null>(null);
  const flipRef = useRef<Flip | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const startFlip = (value: Flip | null) => {
    flipRef.current = value;
    setFlip(value);
  };

  const finishFlip = useCallback(() => {
    clearTimeout(fallbackTimer.current);
    const current = flipRef.current;
    if (!current) return;
    setIndex(current.to);
    startFlip(null);
  }, []);

  const goTo = useCallback((target: number) => {
    const to = Math.max(first, Math.min(last, target));
    if (flipRef.current || to === index) return;

    if (!animate) {
      setIndex(to);
      return;
    }

    startFlip({ from: index, to, direction: to > index ? 'next' : 'prev' });
    // animationend normally finishes the turn; this covers the cases where it never fires
    fallbackTimer.current = setTimeout(finishFlip, FLIP_MS + 300);
  }, [first, last, animate, index, finishFlip]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => () => clearTimeout(fallbackTimer.current), []);

  // Arrow keys turn pages, unless the user is typing somewhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  // Horizontal swipe on touch screens
  const touchStartX = useRef<number | null>(null);
  const swipeHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (dx < -50) next();
      if (dx > 50) prev();
    }
  };

  return { index, flip, goTo, next, prev, finishFlip, swipeHandlers };
};
