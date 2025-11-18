import React, { useState } from 'react';
import { S } from './AIChat.styles';
import { useStoryGenerator } from '../hooks/useStoryGenerator';
import { useTranslation } from '../hooks/useTranslation';
import { pdfService } from '../services/pdfService';

const AIChat: React.FC = () => {
  const {
    stories,
    inputValue,
    isLoading,
    genAI,
    currentStoryId,
    currentPage,
    generateImages,
    toddlerMode,
    quotaError,
    advancedMode,
    formData,
    generationStep,
    imagesGenerated,
    totalImages,
    pendingStory,
    setInputValue,
    setGenerateImages,
    setToddlerMode,
    setCurrentStoryId,
    setCurrentPage,
    generateStory,
    handleKeyDown,
    goToPage,
    nextPage,
    prevPage,
    backToStories,
    dismissQuotaError,
    setAdvancedMode,
    updateFormData,
    validateAdvancedForm,
  } = useStoryGenerator();

  const { language, t, toggleLanguage } = useTranslation();
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [showStoryPreview, setShowStoryPreview] = useState(false);

  const handleDownloadPDF = async () => {
    const currentStory = stories.find(s => s.id === currentStoryId);
    if (!currentStory) return;
    
    setIsDownloadingPDF(true);
    try {
      await pdfService.generateStoryPDF(currentStory);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloadingPDF(false);
    }
  };



  return (
    <S.AppWrapper>
      <S.ChatContainer>
        {!genAI ? (
          <S.ChatBox>
            <S.ErrorMessage>
              <p>{t('apiKeyNotFound')}</p>
              <p>{t('apiKeyInstructions')}</p>
            </S.ErrorMessage>
          </S.ChatBox>
        ) : currentStoryId ? (
          // Multi-page story view
          <>
            {(() => {
              const currentStory = stories.find(s => s.id === currentStoryId);
              if (!currentStory?.pages) return null;
              
              const currentPageData = currentStory?.pages[currentPage];
              return (
                <>
                  {/* Story header with navigation */}
                  <S.StoryHeader>
                    <S.StoryHeaderInfo>
                      <S.StoryTitle>{t('storyTitle')} {currentStory?.prompt}</S.StoryTitle>
                      <S.StoryPageInfo>
                        {t('pageInfo', { current: currentPage + 1, total: currentStory?.pages.length })}
                      </S.StoryPageInfo>
                    </S.StoryHeaderInfo>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <S.DownloadButton 
                        onClick={handleDownloadPDF} 
                        disabled={isDownloadingPDF}
                      >
                        {isDownloadingPDF ? t('downloadingPDF') : t('downloadPDF')}
                      </S.DownloadButton>
                      <S.BackButton onClick={backToStories}>
                        ←
                      </S.BackButton>
                    </div>
                  </S.StoryHeader>

                  {/* Layout: Text + Image (if enabled) */}
                  {generateImages ? (
                    <S.TwoColumnLayout>
                      {/* Left - Text */}
                      <S.StoryTextColumn>
                        <S.StoryText>
                          {currentPageData?.paragraph}
                        </S.StoryText>
                      </S.StoryTextColumn>

                      {/* Right - Image */}
                      <S.StoryImageColumn>
                        {currentPageData?.imageUrl ? (
                          <S.StoryImage 
                            src={currentPageData?.imageUrl} 
                            alt={`${t('illustrationColumn')} ${currentPage + 1}`}
                          />
                        ) : (
                          <S.ImagePlaceholder>
                            <S.LoadingSpinner />
                            <S.ImageLoadingText>{t('generatingImage')}</S.ImageLoadingText>
                          </S.ImagePlaceholder>
                        )}
                      </S.StoryImageColumn>
                    </S.TwoColumnLayout>
                  ) : (
                    /* Single column - Text only */
                    <S.SingleColumnLayout>
                      <S.StoryTextColumn>
                        <S.StoryText>
                          {currentPageData?.paragraph}
                        </S.StoryText>
                      </S.StoryTextColumn>
                    </S.SingleColumnLayout>
                  )}

                  {/* Page navigation */}
                  <S.PageNavigation>
                    <S.NavButton 
                      onClick={prevPage}
                      disabled={currentPage === 0}
                    >
                      <S.NavButtonText>{t('previousPage')}</S.NavButtonText>
                      <S.NavButtonIcon>‹</S.NavButtonIcon>
                    </S.NavButton>

                    {/* Page dots */}
                    <S.PageDotsContainer>
                      {currentStory?.pages.map((_, index) => (
                        <S.PageDot
                          key={index}
                          onClick={() => goToPage(index)}
                          active={index === currentPage}
                        />
                      ))}
                    </S.PageDotsContainer>

                    <S.NavButton 
                      onClick={nextPage}
                      disabled={currentPage === currentStory?.pages?.length - 1}
                    >
                      <S.NavButtonText>{t('nextPage')}</S.NavButtonText>
                      <S.NavButtonIcon>›</S.NavButtonIcon>
                    </S.NavButton>
                  </S.PageNavigation>
                </>
              );
            })()}
          </>
        ) : (
          // Story list view
          <S.ChatBox>
            <S.MessagesContainer>
              {stories.length === 0 && !isLoading && (
                <S.InfoMessage>
                  <p>{t('welcomeMessage')}</p>
                  <S.InfoSubtext>
                    {t('examples')}
                  </S.InfoSubtext>
                </S.InfoMessage>
              )}
              {stories.map((story) => (
                <S.StoryCard key={story.id}>
                  <S.StoryPrompt>
                    <strong>{t('promptLabel')}</strong> {story.prompt}
                  </S.StoryPrompt>
                  <S.StoryContent>
                    {story.content}
                  </S.StoryContent>
                  <S.StoryFooter>
                    <S.StoryTimestamp>
                      {t('generatedOn')} {story.timestamp.toLocaleString()}
                    </S.StoryTimestamp>
                    <S.ReadStoryButton 
                      onClick={() => {
                        setCurrentStoryId(story.id);
                        setCurrentPage(0);
                      }}
                    >
                      {t('readStory')}
                    </S.ReadStoryButton>
                  </S.StoryFooter>
                </S.StoryCard>
              ))}
              {isLoading && (
                <S.LoadingMessage>
                  <S.LoadingSteps>
                    <S.LoadingStep active={generationStep === 'story'} completed={generationStep === 'images' || (generationStep === null && !generateImages)}>
                      <S.StepNumber completed={generationStep === 'images' || (generationStep === null && !generateImages)}>
                        {generationStep === 'images' || (generationStep === null && !generateImages) ? '✓' : '1'}
                      </S.StepNumber>
                      <S.StepContent>
                        {generationStep === 'story' && <S.LoadingSpinner />}
                        <S.StepText>Creating story...</S.StepText>
                      </S.StepContent>
                      {(generationStep === 'images' || (generationStep === null && !generateImages)) && pendingStory && (
                        <S.PreviewButton onClick={() => setShowStoryPreview(true)} title="Preview story">
                          Preview
                        </S.PreviewButton>
                      )}
                    </S.LoadingStep>
                    {generateImages && (
                      <S.LoadingStep active={generationStep === 'images'} completed={generationStep === null && imagesGenerated === totalImages}>
                        <S.StepNumber completed={generationStep === null && imagesGenerated === totalImages}>
                          {generationStep === null && imagesGenerated === totalImages ? '✓' : '2'}
                        </S.StepNumber>
                        <S.StepContent>
                          {generationStep === 'images' && <S.LoadingSpinner />}
                          <S.StepText>
                            Creating images... {imagesGenerated > 0 && `${imagesGenerated}/${totalImages}`}
                          </S.StepText>
                        </S.StepContent>
                      </S.LoadingStep>
                    )}
                  </S.LoadingSteps>
                </S.LoadingMessage>
              )}

              {showStoryPreview && pendingStory && (
                <S.StoryPreviewModal>
                  <S.ModalOverlay onClick={() => setShowStoryPreview(false)} />
                  <S.ModalContent>
                    <S.ModalHeader>
                      <S.ModalTitle>Story Preview</S.ModalTitle>
                      <S.ModalCloseButton onClick={() => setShowStoryPreview(false)}>×</S.ModalCloseButton>
                    </S.ModalHeader>
                    <S.ModalBody>
                      <S.PreviewStoryContent>
                        {pendingStory.pages.map((page, index) => (
                          <S.PreviewParagraph key={index}>
                            {page.paragraph}
                          </S.PreviewParagraph>
                        ))}
                      </S.PreviewStoryContent>
                    </S.ModalBody>
                  </S.ModalContent>
                </S.StoryPreviewModal>
              )}
            </S.MessagesContainer>

            {quotaError && (
              <S.QuotaErrorContainer>
                <strong>{t('quotaNotice')}</strong> {quotaError}
                <S.QuotaErrorButton onClick={dismissQuotaError}>
                  ×
                </S.QuotaErrorButton>
              </S.QuotaErrorContainer>
            )}

            <S.CheckboxContainer>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <S.ToggleSwitch htmlFor="generateImages">
                  <input
                    type="checkbox"
                    id="generateImages"
                    checked={generateImages}
                    onChange={(e) => setGenerateImages(e.target.checked)}
                    disabled={isLoading}
                  />
                  <S.ToggleSlider />
                </S.ToggleSwitch>
                <S.CheckboxLabel htmlFor="generateImages" inactive={!generateImages}>
                  {t('generateIllustrations')}
                </S.CheckboxLabel>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <S.ToggleSwitch htmlFor="toddlerMode">
                  <input
                    type="checkbox"
                    id="toddlerMode"
                    checked={toddlerMode}
                    onChange={(e) => setToddlerMode(e.target.checked)}
                    disabled={isLoading}
                  />
                  <S.ToggleSlider />
                </S.ToggleSwitch>
                <S.CheckboxLabel htmlFor="toddlerMode" inactive={!toddlerMode}>
                  {t('toddlerMode')}
                </S.CheckboxLabel>
              </div>
              <S.LanguageToggle>
                <S.LanguageButton active={language === 'en'} onClick={() => language !== 'en' && toggleLanguage()}>
                  {t('english')}
                </S.LanguageButton>
                <S.LanguageButton active={language === 'es'} onClick={() => language !== 'es' && toggleLanguage()}>
                  {t('spanish')}
                </S.LanguageButton>
              </S.LanguageToggle>
            </S.CheckboxContainer>

            <S.ModeToggle>
              <S.ModeButton 
                active={!advancedMode} 
                onClick={() => setAdvancedMode(false)}
                disabled={isLoading}
              >
                {t('simpleMode')}
              </S.ModeButton>
              <S.ModeButton 
                active={advancedMode} 
                onClick={() => setAdvancedMode(true)}
                disabled={isLoading}
              >
                {t('advancedMode')}
              </S.ModeButton>
            </S.ModeToggle>

            {advancedMode ? (
              <S.AdvancedForm>
                <S.FormField>
                  <S.FormLabel>{t('protagonist')}</S.FormLabel>
                  <S.FormExample>{t('protagonistExample')}</S.FormExample>
                  <S.FormInput
                    type="text"
                    value={formData.protagonist}
                    onChange={(e) => updateFormData('protagonist', e.target.value)}
                    placeholder={t('protagonistPlaceholder')}
                    disabled={isLoading}
                  />
                </S.FormField>

                <S.FormField>
                  <S.FormLabel>{t('goal')}</S.FormLabel>
                  <S.FormExample>{t('goalExample')}</S.FormExample>
                  <S.FormInput
                    type="text"
                    value={formData.goal}
                    onChange={(e) => updateFormData('goal', e.target.value)}
                    placeholder={t('goalPlaceholder')}
                    disabled={isLoading}
                  />
                </S.FormField>

                <S.FormField>
                  <S.FormLabel>{t('setting')}</S.FormLabel>
                  <S.FormExample>{t('settingExample')}</S.FormExample>
                  <S.FormInput
                    type="text"
                    value={formData.setting}
                    onChange={(e) => updateFormData('setting', e.target.value)}
                    placeholder={t('settingPlaceholder')}
                    disabled={isLoading}
                  />
                </S.FormField>

                <S.FormField>
                  <S.FormLabel>{t('problem')}</S.FormLabel>
                  <S.FormExample>{t('problemExample')}</S.FormExample>
                  <S.FormInput
                    type="text"
                    value={formData.problem}
                    onChange={(e) => updateFormData('problem', e.target.value)}
                    placeholder={t('problemPlaceholder')}
                    disabled={isLoading}
                  />
                </S.FormField>

                <S.FormField>
                  <S.FormLabel>{t('helper')}</S.FormLabel>
                  <S.FormExample>{t('helperExample')}</S.FormExample>
                  <S.FormInput
                    type="text"
                    value={formData.helper}
                    onChange={(e) => updateFormData('helper', e.target.value)}
                    placeholder={t('helperPlaceholder')}
                    disabled={isLoading}
                  />
                </S.FormField>

                <S.FormField>
                  <S.FormLabel>{t('ending')}</S.FormLabel>
                  <S.FormExample>{t('endingExample')}</S.FormExample>
                  <S.FormInput
                    type="text"
                    value={formData.ending}
                    onChange={(e) => updateFormData('ending', e.target.value)}
                    placeholder={t('endingPlaceholder')}
                    disabled={isLoading}
                  />
                </S.FormField>

                <S.InputContainer>
                  <S.SendButton 
                    onClick={generateStory} 
                    disabled={isLoading || !validateAdvancedForm()}
                  >
                    {isLoading ? <S.LoadingSpinner /> : t('generateStory')}
                  </S.SendButton>
                  {!validateAdvancedForm() && (
                    <S.FormError>{t('atLeastOneRequired')}</S.FormError>
                  )}
                </S.InputContainer>
              </S.AdvancedForm>
            ) : (
              <S.InputContainer>
                <S.Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('inputPlaceholder')}
                  disabled={isLoading}
                />
                <S.SendButton onClick={generateStory} disabled={isLoading || !inputValue.trim()}>
                  {isLoading ? <S.LoadingSpinner /> : t('generateStory')}
                </S.SendButton>
              </S.InputContainer>
            )}
          </S.ChatBox>
        )}
      </S.ChatContainer>
    </S.AppWrapper>
  );
};

export default AIChat;

