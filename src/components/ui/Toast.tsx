import React from 'react';
import styled, { keyframes } from 'styled-components';

/** Notification bubble pinned to the top of the screen */
export const Toast: React.FC<{ icon?: string; children: React.ReactNode; onClose?: () => void }> = ({ icon = '⚠️', children, onClose }) => (
  <Wrapper role="status">
    <span aria-hidden>{icon}</span>
    <Text>{children}</Text>
    {onClose && <Close onClick={onClose} aria-label="Close">×</Close>}
  </Wrapper>
);

const slideDown = keyframes`
  from { transform: translate(-50%, -120%); }
  to { transform: translate(-50%, 0); }
`;

const Wrapper = styled.div`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 60;
  width: min(560px, calc(100% - 32px));
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px 12px 16px;
  background: #fff1f4;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.chunky};
  animation: ${slideDown} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

const Text = styled.div`
  flex: 1;
  font-weight: 600;
`;

const Close = styled.button`
  border: none;
  background: none;
  font-size: 1.4rem;
  line-height: 1;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ink};
`;
