import type React from 'react';
import styled, { keyframes } from 'styled-components';

/** Chunky striped progress bar; value from 0 to 100 */
export const ProgressBar: React.FC<{ value: number; label?: string }> = ({ value, label }) => (
  <Track role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} aria-label={label}>
    <Fill style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
  </Track>
);

const stripes = keyframes`
  from { background-position: 0 0; }
  to { background-position: 40px 0; }
`;

const Track = styled.div`
  width: 100%;
  height: 26px;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  border-radius: 999px;
  background: #ece7f7;
  overflow: hidden;
  box-shadow: inset 0 3px 0 rgba(61, 53, 87, 0.12);
`;

const Fill = styled.div`
  height: 100%;
  border-radius: 999px;
  border-right: 3px solid ${({ theme }) => theme.colors.outline};
  background-color: ${({ theme }) => theme.colors.leaf};
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.28) 0 10px,
    transparent 10px 20px
  );
  background-size: 40px 100%;
  animation: ${stripes} 1s linear infinite;
  transition: width 0.4s ease;
`;
