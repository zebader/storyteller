import styled from 'styled-components';

// Styled Components for AIChat
export namespace S {
  export const AppWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

  export const ChatContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
`;

  export const ChatBox = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

  export const MessagesContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: #f9f9f9;
`;

  export const Message = styled.div<{ isUser: boolean }>`
  margin: 10px 0;
  padding: 15px;
  border-radius: 15px;
  max-width: 80%;
  word-wrap: break-word;
  background: ${props => props.isUser ? '#007bff' : '#e9ecef'};
  color: ${props => props.isUser ? 'white' : '#333'};
  margin-left: ${props => props.isUser ? 'auto' : '0'};
  margin-right: ${props => props.isUser ? '0' : 'auto'};
`;

  export const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

  export const Input = styled.input`
  flex: 1;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #007bff;
  }
`;

  export const SendButton = styled.button`
  padding: 15px 25px;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 123, 255, 0.4);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

  export const ApiKeyInput = styled.div`
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

  export const ApiKeyField = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 14px;
  margin-bottom: 10px;
  outline: none;

  &::placeholder {
    color: #666;
  }
`;

  export const ApiKeyLabel = styled.label`
  color: white;
  font-size: 14px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
`;

  export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Error and Info Messages
  export const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

  export const InfoMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

  export const InfoSubtext = styled.p`
  font-size: 0.9rem;
  margin-top: 10px;
`;

// Story View Components
  export const StoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
`;

  export const StoryHeaderInfo = styled.div``;

  export const StoryTitle = styled.h3`
  margin: 0;
  color: #333;
`;

  export const StoryPageInfo = styled.p`
  margin: 5px 0 0 0;
  font-size: 0.9rem;
  color: #666;
`;

  export const BackButton = styled.button`
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #5a6268;
  }
`;

// Two Column Layout
  export const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  min-height: 400px;
`;

  export const SingleColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  min-height: 400px;
`;

  export const StoryTextColumn = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

  export const StoryImageColumn = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

  export const ColumnTitle = styled.h4`
  margin: 0 0 15px 0;
  color: #333;
`;

  export const StoryText = styled.div`
  line-height: 1.8;
  font-size: 1.1rem;
  color: #333;
`;

  export const StoryImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
`;

  export const ImagePlaceholder = styled.div`
  width: 200px;
  height: 200px;
  background: #e9ecef;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;

  export const ImageLoadingText = styled.span`
  margin-left: 10px;
`;

// Navigation Components
  export const PageNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
`;

  export const NavButton = styled.button<{ disabled?: boolean }>`
  padding: 10px 20px;
  background: ${props => props.disabled ? '#e9ecef' : '#007bff'};
  color: ${props => props.disabled ? '#666' : 'white'};
  border: none;
  border-radius: 5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.disabled ? '#e9ecef' : '#0056b3'};
  }
`;

  export const PageDotsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

  export const PageDot = styled.button<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${props => props.active ? '#007bff' : '#e9ecef'};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#0056b3' : '#dee2e6'};
  }
`;

// Story List Components
  export const StoryCard = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
`;

  export const StoryPrompt = styled.div`
  margin-bottom: 15px;
  padding: 10px;
  background: #e9ecef;
  border-radius: 5px;
`;

  export const StoryContent = styled.div`
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: 15px;
`;

  export const StoryFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

  export const StoryTimestamp = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

  export const ReadStoryButton = styled.button`
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }
`;

// Loading and Error States
  export const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

  export const QuotaErrorContainer = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 10px;
  color: #856404;
`;

  export const QuotaErrorButton = styled.button`
  margin-left: 10px;
  background: none;
  border: none;
  color: #856404;
  cursor: pointer;
  font-size: 1.2rem;
  transition: color 0.2s ease;

  &:hover {
    color: #6c4a00;
  }
`;

// Checkbox Container
  export const CheckboxContainer = styled.div`
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

  export const CheckboxLabel = styled.label`
  color: #333;
  cursor: pointer;
`;

  // Language Toggle
  export const LanguageToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

  export const LanguageButton = styled.button<{ active: boolean }>`
  padding: 8px 12px;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.25)' : 'transparent'};
  color: white;
  border: 2px solid ${props => props.active ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 15px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;
}
