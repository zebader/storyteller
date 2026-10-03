import { afterEach, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('shows the Groq setup message when the server has no API key', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ status: 'ok', groqConfigured: false })
  }));

  render(<App />);

  expect(await screen.findByText(/GROQ_API_KEY/)).toBeInTheDocument();
});
