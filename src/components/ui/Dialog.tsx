import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface DialogProps {
  title: string;
  icon?: string;
  onClose?: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

/** Game-style modal dialog. Closes on Escape and backdrop click when onClose is given. */
export const Dialog: React.FC<DialogProps> = ({ title, icon, onClose, children, actions }) => {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <Backdrop onClick={onClose}>
      <Box role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <Header>
          {icon && <span aria-hidden>{icon}</span>}
          <Title>{title}</Title>
          {onClose && <Close onClick={onClose} aria-label="Close">×</Close>}
        </Header>
        <Body>{children}</Body>
        {actions && <Actions>{actions}</Actions>}
      </Box>
    </Backdrop>
  );
};

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const popIn = keyframes`
  0% { transform: scale(0.8) translateY(20px); opacity: 0; }
  70% { transform: scale(1.03); opacity: 1; }
  100% { transform: scale(1); }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(61, 53, 87, 0.45);
  animation: ${fadeIn} 0.2s ease;
`;

const Box = styled.div`
  width: min(560px, 100%);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.panel};
  border: 3px solid ${({ theme }) => theme.colors.outline};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.chunky};
  animation: ${popIn} 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: ${({ theme }) => theme.colors.sun};
  border-bottom: 3px solid ${({ theme }) => theme.colors.outline};
  font-size: 1.4rem;
`;

const Title = styled.h2`
  flex: 1;
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.3rem;
  font-weight: 600;
`;

const Close = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  background: ${({ theme }) => theme.colors.panel};
  font-size: 1.2rem;
  line-height: 1;
  font-weight: 700;
`;

const Body = styled.div`
  padding: 20px;
  overflow-y: auto;
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0 20px 14px;
`;
