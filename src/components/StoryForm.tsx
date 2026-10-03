import React from 'react';
import styled from 'styled-components';
import { useTranslation, type TranslationKey } from '../hooks/useTranslation';
import type { useStoryGenerator } from '../hooks/useStoryGenerator';
import { GameButton } from './ui/GameButton';

type Generator = ReturnType<typeof useStoryGenerator>;
type FormField = keyof Generator['formData'];

const ADVANCED_FIELDS: { field: FormField; icon: string }[] = [
  { field: 'protagonist', icon: '🦸' },
  { field: 'goal', icon: '🎯' },
  { field: 'setting', icon: '🏰' },
  { field: 'problem', icon: '🐉' },
  { field: 'helper', icon: '🧚' },
  { field: 'ending', icon: '🌈' }
];

type StoryFormProps = Pick<
  Generator,
  | 'advancedMode'
  | 'setAdvancedMode'
  | 'inputValue'
  | 'setInputValue'
  | 'handleKeyDown'
  | 'formData'
  | 'updateFormData'
  | 'validateAdvancedForm'
  | 'generateStory'
  | 'isLoading'
>;

/** Simple prompt or the six guided questions, plus the big create button */
export const StoryForm: React.FC<StoryFormProps> = ({
  advancedMode,
  setAdvancedMode,
  inputValue,
  setInputValue,
  handleKeyDown,
  formData,
  updateFormData,
  validateAdvancedForm,
  generateStory,
  isLoading
}) => {
  const { t } = useTranslation();
  const canSubmit = advancedMode ? validateAdvancedForm() : !!inputValue.trim();

  return (
    <div>
      <Tabs role="tablist">
        <Tab role="tab" aria-selected={!advancedMode} $active={!advancedMode} onClick={() => setAdvancedMode(false)} disabled={isLoading}>
          ✏️ {t('simpleMode')}
        </Tab>
        <Tab role="tab" aria-selected={advancedMode} $active={advancedMode} onClick={() => setAdvancedMode(true)} disabled={isLoading}>
          🧩 {t('advancedMode')}
        </Tab>
      </Tabs>

      {advancedMode ? (
        <FieldGrid>
          {ADVANCED_FIELDS.map(({ field, icon }) => (
            <FieldCard key={field}>
              <FieldLabel htmlFor={`field-${field}`}>
                <span aria-hidden>{icon}</span> {t(field as TranslationKey)}
              </FieldLabel>
              <TextInput
                id={`field-${field}`}
                type="text"
                value={formData[field]}
                onChange={(e) => updateFormData(field, e.target.value)}
                placeholder={t(`${field}Placeholder` as TranslationKey)}
                disabled={isLoading}
              />
              <Hint>{t(`${field}Example` as TranslationKey)}</Hint>
            </FieldCard>
          ))}
        </FieldGrid>
      ) : (
        <>
          <PromptInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('inputPlaceholder')}
            disabled={isLoading}
            rows={3}
          />
          <Hint>{t('examples')}</Hint>
        </>
      )}

      <Submit>
        <GameButton $tone="berry" $size="lg" onClick={generateStory} disabled={isLoading || !canSubmit}>
          {t('createStoryButton')}
        </GameButton>
        {advancedMode && !canSubmit && <Hint>{t('atLeastOneRequired')}</Hint>}
      </Submit>
    </div>
  );
};

const Tabs = styled.div`
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  margin-bottom: 16px;
  background: #ece7f7;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  border-radius: 999px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 8px 18px;
  border: none;
  border-radius: 999px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 600;
  font-size: 1rem;
  white-space: nowrap;
  background: ${({ theme, $active }) => ($active ? theme.colors.sun : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? '0 3px 0 rgba(61, 53, 87, 0.3)' : 'none')};
  transition: background 0.2s ease;

  @media (max-width: 420px) {
    padding: 8px 12px;
    font-size: 0.92rem;
  }
`;

const inputStyles = `
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  background: #fff;
  font-size: 1.05rem;
  transition: box-shadow 0.15s ease;
`;

const PromptInput = styled.textarea`
  ${inputStyles}
  display: block;
  resize: vertical;
  min-height: 96px;
  border: 3px solid ${({ theme }) => theme.colors.outline};

  &:focus {
    outline: none;
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.sky}66;
  }
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const FieldCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 18px;
  background: #fff;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  box-shadow: 0 4px 0 rgba(61, 53, 87, 0.15);
`;

const FieldLabel = styled.label`
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 600;
`;

const TextInput = styled.input`
  ${inputStyles}
  padding: 10px 12px;
  border: 2px solid ${({ theme }) => theme.colors.paperShade};
  background: ${({ theme }) => theme.colors.paper};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.sky};
  }
`;

const Hint = styled.p`
  margin: 8px 4px 0;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

const Submit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 22px;
`;
