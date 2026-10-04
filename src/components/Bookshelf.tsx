import React, { useState } from 'react';
import styled from 'styled-components';
import type { Story } from '../hooks/useStoryGenerator';
import { useTranslation } from '../hooks/useTranslation';
import { Dialog } from './ui/Dialog';
import { GameButton } from './ui/GameButton';
import { bookColor } from './bookColors';

interface BookshelfProps {
  stories: Story[];
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
}

/** Saved stories as little book covers; failed generations show their error instead */
export const Bookshelf: React.FC<BookshelfProps> = ({ stories, onOpen, onDelete }) => {
  const { t } = useTranslation();
  const [toDelete, setToDelete] = useState<Story | null>(null);

  const binButton = (story: Story) => (
    <BinButton onClick={() => setToDelete(story)} aria-label={t('deleteBook')} title={t('deleteBook')}>
      🗑️
    </BinButton>
  );

  return (
    <section>
      <Heading>📚 {t('myBooks')}</Heading>
      {stories.length === 0 ? (
        <Empty>{t('emptyShelf')}</Empty>
      ) : (
        <Shelf>
          {stories.map(story => {
            if (story.pages.length === 0) {
              return (
                <Slot key={story.id}>
                  <Failed>
                    <span aria-hidden>⚠️</span>
                    <p>{story.content}</p>
                  </Failed>
                  {binButton(story)}
                </Slot>
              );
            }

            const cover = story.pages.find(page => page.imageUrl)?.imageUrl;
            return (
              <Slot key={story.id}>
                <BookCover
                  onClick={() => onOpen(story.id)}
                  $color={bookColor(story.id).cover}
                  title={story.prompt}
                >
                  <Art>{cover ? <img src={cover} alt="" /> : <span aria-hidden>📖</span>}</Art>
                  <BookTitle>{story.prompt}</BookTitle>
                  <Meta>
                    {t('pagesCount', { count: story.pages.length })} · {story.timestamp.toLocaleDateString()}
                  </Meta>
                </BookCover>
                {binButton(story)}
              </Slot>
            );
          })}
        </Shelf>
      )}

      {toDelete && (
        <Dialog
          title={t('deleteBookTitle')}
          icon="🗑️"
          onClose={() => setToDelete(null)}
          actions={
            <>
              <GameButton $tone="paper" onClick={() => setToDelete(null)}>{t('cancel')}</GameButton>
              <GameButton
                $tone="berry"
                onClick={() => {
                  onDelete(toDelete.id);
                  setToDelete(null);
                }}
              >
                {t('deleteConfirmButton')}
              </GameButton>
            </>
          }
        >
          {t('deleteBookConfirm', { title: toDelete.prompt })}
        </Dialog>
      )}
    </section>
  );
};

const Heading = styled.h2`
  margin: 0 0 14px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.5rem;
  font-weight: 600;
`;

const Empty = styled.p`
  margin: 0;
  padding: 18px;
  text-align: center;
  border: 3px dashed ${({ theme }) => theme.colors.paperShade};
  border-radius: 18px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

const Shelf = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 18px;
  padding-bottom: 14px;
  /* The wooden shelf the books stand on */
  border-bottom: 14px solid #c98b5a;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 6px 0 #a8693e;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
`;

// Holds a book plus its bin button (a button can't contain another button)
const Slot = styled.div`
  position: relative;
  display: flex;

  > :first-child {
    flex: 1;
  }
`;

const BinButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 1;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  font-size: 1.05rem;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.outline};
  background: ${({ theme }) => theme.colors.panel};
  box-shadow: 0 3px 0 rgba(61, 53, 87, 0.3);
  transition: transform 0.12s ease, background 0.12s ease;

  &:hover {
    transform: scale(1.1) rotate(-8deg);
    background: #ffe1e8;
  }
`;

const BookCover = styled.button<{ $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 10px 12px 18px;
  text-align: center;
  background: ${({ $color }) => $color};
  border: 3px solid ${({ theme }) => theme.colors.outline};
  /* Rounded on the open side, a darker spine on the left */
  border-radius: 6px 16px 16px 6px;
  box-shadow: inset 8px 0 0 rgba(0, 0, 0, 0.15), 0 6px 0 rgba(61, 53, 87, 0.25);
  color: #fff;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-6px) rotate(-1.5deg);
  }
`;

const Art = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.paper};
  border: 3px solid ${({ theme }) => theme.colors.outline};
  font-size: 2.6rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BookTitle = styled.span`
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 600;
  line-height: 1.2;
  text-shadow: 1px 2px 0 rgba(61, 53, 87, 0.6);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Meta = styled.span`
  font-size: 0.8rem;
  opacity: 0.9;
`;

const Failed = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  border: 3px dashed ${({ theme }) => theme.colors.berry};
  border-radius: 16px;
  background: #fff1f4;
  font-size: 0.85rem;

  p {
    margin: 0;
    white-space: pre-line;
  }
`;
