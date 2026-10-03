import { afterEach, expect, test, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../theme';
import { LanguageProvider } from '../../hooks/useTranslation';
import type { Story } from '../../hooks/useStoryGenerator';
import { StoryBook } from './StoryBook';
import { FLIP_MS } from './useBookNavigation';

const story: Story = {
  id: 1,
  prompt: 'A friendly dragon',
  content: '',
  timestamp: new Date(),
  pages: ['Page one text', 'Page two text', 'Page three text'].map(paragraph => ({
    paragraph,
    imagePrompt: paragraph
  }))
};

const renderBook = () =>
  render(
    <ThemeProvider theme={theme}>
      <LanguageProvider>
        <StoryBook story={story} onBack={() => {}} />
      </LanguageProvider>
    </ThemeProvider>
  );

afterEach(() => {
  vi.useRealTimers();
});

test('opens from the cover and turns pages with the button and arrow keys', () => {
  renderBook();

  // Starts on the cover
  expect(screen.getByRole('button', { name: /Abrir el libro/ })).toBeInTheDocument();
  expect(screen.queryByText('Page one text')).not.toBeInTheDocument();

  // Opening flips the cover; the turn finishes when the leaf's animation ends
  fireEvent.click(screen.getByRole('button', { name: /Abrir el libro/ }));
  fireEvent.animationEnd(screen.getByTestId('page-leaf'));
  expect(screen.getByText('Page one text')).toBeInTheDocument();
  expect(screen.queryByTestId('page-leaf')).not.toBeInTheDocument();

  // Arrow key turns to the next page
  fireEvent.keyDown(window, { key: 'ArrowRight' });
  fireEvent.animationEnd(screen.getByTestId('page-leaf'));
  expect(screen.getByText('Page two text')).toBeInTheDocument();
  expect(screen.queryByText('Page one text')).not.toBeInTheDocument();

  // And back
  fireEvent.keyDown(window, { key: 'ArrowLeft' });
  fireEvent.animationEnd(screen.getByTestId('page-leaf'));
  expect(screen.getByText('Page one text')).toBeInTheDocument();
});

test('ignores new turns while a page is turning, and finishes even if animationend never fires', () => {
  vi.useFakeTimers();
  renderBook();

  fireEvent.keyDown(window, { key: 'ArrowRight' });
  fireEvent.keyDown(window, { key: 'ArrowRight' });

  act(() => {
    vi.advanceTimersByTime(FLIP_MS + 400);
  });

  // Only one turn happened: from the cover to the first page
  expect(screen.getByText('Page one text')).toBeInTheDocument();
  expect(screen.queryByTestId('page-leaf')).not.toBeInTheDocument();
});
