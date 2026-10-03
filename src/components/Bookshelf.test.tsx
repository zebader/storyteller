import { expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../theme';
import { LanguageProvider } from '../hooks/useTranslation';
import type { Story } from '../hooks/useStoryGenerator';
import { Bookshelf } from './Bookshelf';

const story: Story = {
  id: 7,
  prompt: 'A friendly dragon',
  content: '',
  timestamp: new Date(),
  pages: [{ paragraph: 'Once upon a time', imagePrompt: '' }]
};

test('the bin button asks for confirmation before deleting a book', () => {
  const onDelete = vi.fn();
  render(
    <ThemeProvider theme={theme}>
      <LanguageProvider>
        <Bookshelf stories={[story]} onOpen={() => {}} onDelete={onDelete} />
      </LanguageProvider>
    </ThemeProvider>
  );

  // Cancelling keeps the book
  fireEvent.click(screen.getByRole('button', { name: 'Borrar libro' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(onDelete).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  // Confirming deletes it
  fireEvent.click(screen.getByRole('button', { name: 'Borrar libro' }));
  fireEvent.click(screen.getByRole('button', { name: 'Borrar' }));
  expect(onDelete).toHaveBeenCalledWith(7);
});
