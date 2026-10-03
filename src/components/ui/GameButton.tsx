import styled, { css } from 'styled-components';
import { toneColors, type Tone } from '../../theme';

type Size = 'sm' | 'md' | 'lg';

const sizes: Record<Size, ReturnType<typeof css>> = {
  sm: css`padding: 8px 14px; font-size: 0.95rem; border-radius: 14px;`,
  md: css`padding: 12px 22px; font-size: 1.1rem; border-radius: 18px;`,
  lg: css`padding: 16px 32px; font-size: 1.35rem; border-radius: 22px;`
};

/**
 * Chunky "game" button: a thick darker bottom edge that compresses when pressed.
 */
export const GameButton = styled.button<{ $tone?: Tone; $size?: Size; $round?: boolean }>`
  --edge: 6px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  background: ${({ theme, $tone = 'sun' }) => toneColors(theme, $tone).bg};
  color: ${({ theme, $tone = 'sun' }) => toneColors(theme, $tone).text};
  box-shadow: 0 var(--edge) 0 ${({ theme, $tone = 'sun' }) => toneColors(theme, $tone).edge},
    0 var(--edge) 0 3px ${({ theme }) => theme.colors.outline};
  margin-bottom: calc(var(--edge) + 3px);
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
  ${({ $size = 'md' }) => sizes[$size]}
  ${({ $round, $size = 'md' }) => $round && css`
    border-radius: 50%;
    padding: 0;
    width: ${$size === 'lg' ? '64px' : $size === 'md' ? '52px' : '42px'};
    height: ${$size === 'lg' ? '64px' : $size === 'md' ? '52px' : '42px'};
  `}

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.05);
  }

  &:active:not(:disabled) {
    --edge: 1px;
    transform: translateY(5px);
  }

  &:disabled {
    filter: grayscale(0.6) opacity(0.6);
  }
`;
