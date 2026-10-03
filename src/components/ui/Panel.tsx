import styled from 'styled-components';

/** Cream card with a thick cartoon outline */
export const Panel = styled.div`
  background: ${({ theme }) => theme.colors.panel};
  border: 3px solid ${({ theme }) => theme.colors.outline};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.chunky};
  padding: 24px;

  @media (max-width: 600px) {
    padding: 18px;
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;
