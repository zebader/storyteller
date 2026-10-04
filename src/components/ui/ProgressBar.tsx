import type React from 'react';
import styled, { keyframes } from 'styled-components';

/** Chunky striped progress bar; value from 0 to 100 */
export const ProgressBar: React.FC<{ value: number; label?: string }> = ({ value, label }) => (
  <Track role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} aria-label={label}>
    <Fill style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </Track>
);

// One square tile of the diagonal stripes; moving by exactly one tile keeps the animation seamless
const STRIPE_TILE = 24;

const stripes = keyframes`
  from { background-position: 0 0; }
  to { background-position: ${STRIPE_TILE}px 0; }
`;

const Track = styled.div`
  width: 100%;
  height: 28px;
  padding: 4px;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  border-radius: 999px;
  background: #ece7f7;
  box-shadow: inset 0 3px 0 rgba(61, 53, 87, 0.1);
`;

const Fill = styled.div`
  position: relative;
  height: 100%;
  /* Keep the rounded end visible even at 0% */
  min-width: 14px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.leaf};
  background-image: linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.18) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.18) 50%,
    rgba(255, 255, 255, 0.18) 75%,
    transparent 75%
  );
  background-size: ${STRIPE_TILE}px ${STRIPE_TILE}px;
  box-shadow: inset 0 -3px 0 ${({ theme }) => theme.colors.leafDark};
  animation: ${stripes} 0.8s linear infinite;
  transition: width 0.4s ease;

  /* Glossy highlight along the top */
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 6px;
    right: 6px;
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.45);
  }
`;
