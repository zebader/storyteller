import { useEffect, useState } from 'react';

const matches = (query: string) =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;

/** Live result of a CSS media query (false where matchMedia isn't available, e.g. tests) */
export const useMediaQuery = (query: string): boolean => {
  const [value, setValue] = useState(() => matches(query));

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(query);
    const onChange = () => setValue(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return value;
};
