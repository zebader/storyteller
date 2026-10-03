import React from 'react';
import styled from 'styled-components';

interface ToggleChipProps {
  id: string;
  icon: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  badge?: string;
  onChange: (checked: boolean) => void;
}

/** A pill-shaped on/off option with an icon and a little switch */
export const ToggleChip: React.FC<ToggleChipProps> = ({ id, icon, label, checked, disabled, badge, onChange }) => (
  <Chip htmlFor={id} $checked={checked} $disabled={!!disabled}>
    <input
      id={id}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span aria-hidden>{icon}</span>
    <span>{label}</span>
    <Switch $checked={checked} aria-hidden />
    {badge && <Badge title={badge}>!</Badge>}
  </Chip>
);

const Chip = styled.label<{ $checked: boolean; $disabled: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 8px 14px;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $checked }) => ($checked ? '#e6f9e9' : theme.colors.panel)};
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 500;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  user-select: none;
  transition: background 0.2s ease, transform 0.12s ease;

  &:hover {
    transform: ${({ $disabled }) => ($disabled ? 'none' : 'translateY(-1px)')};
  }

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &:has(input:focus-visible) {
    outline: 3px solid ${({ theme }) => theme.colors.sky};
    outline-offset: 3px;
  }
`;

const Switch = styled.span<{ $checked: boolean }>`
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid ${({ theme }) => theme.colors.outline};
  background: ${({ theme, $checked }) => ($checked ? theme.colors.leaf : '#d8d3e6')};
  transition: background 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $checked }) => ($checked ? '18px' : '2px')};
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid ${({ theme }) => theme.colors.outline};
    transition: left 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -10px;
  right: -8px;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.outline};
  background: ${({ theme }) => theme.colors.berry};
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
`;
