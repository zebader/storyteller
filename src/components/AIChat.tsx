import React from 'react';
import { S } from './AIChat.styles';
import { useStoryGenerator } from '../hooks/useStoryGenerator';
import { useTranslation } from '../hooks/useTranslation';

const AIChat: React.FC = () => {
  const {
    stories,
    inputValue,
    isLoading,
    genAI,
    currentStoryId,
    currentPage,
    generateImages,
    quotaError,
    setInputValue,
    setGenerateImages,
    setCurrentStoryId,
    setCurrentPage,
    generateStory,
    handleKeyDown,
    goToPage,
    nextPage,
    prevPage,
    backToStories,
    dismissQuotaError,
  } = useStoryGenerator();

  const { language, t, toggleLanguage } = useTranslation();



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
                    <S.BackButton onClick={backToStories}>
                      ←
                    </S.BackButton>
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
                  <S.LoadingSpinner />
                  <p>{t('creatingStory', { withImages: generateImages ? t('withImages') : '' })}</p>
                </S.LoadingMessage>
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
                <input
                  type="checkbox"
                  id="generateImages"
                  checked={generateImages}
                  onChange={(e) => setGenerateImages(e.target.checked)}
                  disabled={isLoading}
                />
                <S.CheckboxLabel htmlFor="generateImages">
                  {t('generateIllustrations')}
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
          </S.ChatBox>
        )}
      </S.ChatContainer>
    </S.AppWrapper>
  );
};

export default AIChat;

