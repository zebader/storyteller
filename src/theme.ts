// Design tokens for the "cozy cartoon game" look
export const theme = {
  colors: {
    skyTop: '#8fd3ff',
    skyBottom: '#d9f1ff',
    cloud: '#ffffff',
    hillBack: '#9be08a',
    hillFront: '#6fcf6a',

    paper: '#fff8e7',
    paperShade: '#f3e6c4',
    panel: '#fffdf6',
    ink: '#3d3557',
    inkSoft: '#7a7095',
    outline: '#3d3557',

    sun: '#ffc93c',
    sunDark: '#e0a400',
    berry: '#ff6b8b',
    berryDark: '#d9456a',
    leaf: '#58c46b',
    leafDark: '#379a4a',
    sky: '#4fb3ff',
    skyDark: '#2a8ad6',
    grape: '#9b7bff',
    grapeDark: '#7353e0',

    cover: '#ff8a5c',
    coverDark: '#d9643a',
    ribbon: '#ff6b8b'
  },
  fonts: {
    display: "'Fredoka', 'Nunito', system-ui, sans-serif",
    body: "'Nunito', system-ui, -apple-system, 'Segoe UI', sans-serif"
  },
  radii: {
    sm: '10px',
    md: '18px',
    lg: '28px',
    pill: '999px'
  },
  shadows: {
    // Chunky "game" shadows: a solid offset plus a soft drop
    chunky: '0 6px 0 rgba(61, 53, 87, 0.25), 0 12px 24px rgba(61, 53, 87, 0.15)',
    soft: '0 10px 30px rgba(61, 53, 87, 0.15)',
    book: '0 30px 60px rgba(61, 53, 87, 0.35)'
  },
  breakpoints: {
    // Two-page spread above this width, single page below
    book: '900px'
  }
};

export type AppTheme = typeof theme;

/** Button color sets, used by GameButton and friends */
export type Tone = 'sun' | 'berry' | 'leaf' | 'sky' | 'grape' | 'paper';

export const toneColors = (t: AppTheme, tone: Tone) => {
  const c = t.colors;
  switch (tone) {
    case 'berry': return { bg: c.berry, edge: c.berryDark, text: '#fff' };
    case 'leaf': return { bg: c.leaf, edge: c.leafDark, text: '#fff' };
    case 'sky': return { bg: c.sky, edge: c.skyDark, text: '#fff' };
    case 'grape': return { bg: c.grape, edge: c.grapeDark, text: '#fff' };
    case 'paper': return { bg: c.panel, edge: c.paperShade, text: c.ink };
    case 'sun':
    default: return { bg: c.sun, edge: c.sunDark, text: c.ink };
  }
};
