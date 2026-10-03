import React from 'react';
import styled, { keyframes } from 'styled-components';

/** Pastel sky with drifting clouds and rolling hills, fixed behind every screen */
export const SkyBackground: React.FC = () => (
  <Sky aria-hidden>
    <Sun />
    <Cloud style={{ top: '8%', width: 160, animationDuration: '70s', animationDelay: '-10s' }} />
    <Cloud style={{ top: '22%', width: 110, animationDuration: '90s', animationDelay: '-50s', opacity: 0.8 }} />
    <Cloud style={{ top: '38%', width: 200, animationDuration: '110s', animationDelay: '-80s', opacity: 0.7 }} />
    <Cloud style={{ top: '14%', width: 90, animationDuration: '60s', animationDelay: '-35s' }} />
    <Hills viewBox="0 0 1440 220" preserveAspectRatio="none">
      <path d="M0 120 C 240 40 420 160 720 100 C 1000 40 1200 140 1440 80 L1440 220 L0 220 Z" fill="#9be08a" />
      <path d="M0 170 C 300 110 520 200 820 150 C 1100 100 1260 180 1440 140 L1440 220 L0 220 Z" fill="#6fcf6a" />
    </Hills>
  </Sky>
);

const drift = keyframes`
  from { transform: translateX(-30vw); }
  to { transform: translateX(130vw); }
`;

const Sky = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.skyTop} 0%, ${({ theme }) => theme.colors.skyBottom} 75%);
`;

const Sun = styled.div`
  position: absolute;
  top: 6%;
  right: 8%;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #fff3b0, #ffd84d 60%);
  box-shadow: 0 0 0 18px rgba(255, 216, 77, 0.25), 0 0 0 40px rgba(255, 216, 77, 0.12);
`;

// A cloud built from one rounded body plus two "puffs"
const Cloud = styled.div`
  position: absolute;
  left: 0;
  aspect-ratio: 2.6 / 1;
  background: ${({ theme }) => theme.colors.cloud};
  border-radius: 999px;
  animation: ${drift} linear infinite;

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: inherit;
    border-radius: 50%;
  }

  &::before {
    width: 45%;
    aspect-ratio: 1;
    left: 15%;
    bottom: 35%;
  }

  &::after {
    width: 35%;
    aspect-ratio: 1;
    right: 18%;
    bottom: 30%;
  }
`;

const Hills = styled.svg`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 22vh;
  min-height: 120px;
`;
