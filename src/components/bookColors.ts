import { theme, type AppTheme } from '../theme';

/** Cover color sets: the cover, its darker spine/edge shade, and a contrasting ribbon */
const BOOK_COLORS = [
  { cover: '#ff8a5c', coverDark: '#d9643a', ribbon: '#ff6b8b' },
  { cover: '#4fb3ff', coverDark: '#2a8ad6', ribbon: '#ffc93c' },
  { cover: '#9b7bff', coverDark: '#7353e0', ribbon: '#ffc93c' },
  { cover: '#58c46b', coverDark: '#379a4a', ribbon: '#ff6b8b' },
  { cover: '#ff6b8b', coverDark: '#d9456a', ribbon: '#ffc93c' },
  { cover: '#ffc93c', coverDark: '#e0a400', ribbon: '#ff6b8b' }
];

/**
 * A story's book color. Story ids are creation timestamps, so this is effectively
 * random per story, yet always the same for that story (on the shelf and in the reader).
 */
export const bookColor = (storyId: number) => BOOK_COLORS[Math.abs(storyId) % BOOK_COLORS.length];

/** The app theme with the book colors swapped for this story's */
export const withBookColors = (storyId: number): AppTheme => ({
  ...theme,
  colors: { ...theme.colors, ...bookColor(storyId) }
});
