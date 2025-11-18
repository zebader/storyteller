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
  flex-shrink: 0;

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
  margin: 20px 20px 40px 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1002;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    margin: 15px 15px 30px 15px;
    padding: 12px;
    flex-wrap: wrap;
    gap: 10px;
  }

  @media (max-width: 480px) {
    margin: 10px 10px 20px 10px;
    padding: 10px;
    gap: 8px;
  }
`;

  export const StoryHeaderInfo = styled.div``;

  export const StoryTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100vw - 200px);
  
  @media (max-width: 768px) {
    max-width: calc(100vw - 120px);
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    max-width: calc(100vw - 100px);
    font-size: 1rem;
  }
`;

  export const StoryPageInfo = styled.p`
  margin: 5px 0 0 0;
  font-size: 0.9rem;
  color: #666;
`;

  export const BackButton = styled.button`
  padding: 8px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  height: calc(100vh - 200px);
  position: fixed;
  top: 100px;
  left: 0;
  right: 0;
  padding: 20px;
  z-index: 1000;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: 15px;
    height: calc(100vh - 180px);
    top: 90px;
    padding: 15px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    height: calc(100vh - 160px);
    top: 80px;
    padding: 10px;
  }
`;

  export const SingleColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  min-height: 400px;
  padding: 20px;
  padding-top: 120px; /* Clear fixed StoryHeader */
  padding-bottom: 100px; /* Clear fixed PageNavigation */

  @media (max-width: 768px) {
    padding: 15px;
    padding-top: 100px; /* Match smaller header offset */
    padding-bottom: 90px; /* Match smaller nav offset */
  }

  @media (max-width: 480px) {
    padding: 10px;
    padding-top: 90px; /* Match smallest header offset */
    padding-bottom: 80px; /* Match smallest nav offset */
  }
`;

  export const StoryTextColumn = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  overflow-y: auto;
  padding-right: 10px;

  @media (max-width: 768px) {
    padding: 15px;
    padding-right: 15px;
    height: auto;
    min-height: 200px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    padding-right: 10px;
    min-height: 150px;
  }
`;

  export const StoryImageColumn = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;

  @media (max-width: 768px) {
    padding: 15px;
    height: auto;
    min-height: 250px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    min-height: 200px;
  }
`;

  export const ColumnTitle = styled.h4`
  margin: 0 0 15px 0;
  color: #333;
`;

  export const StoryText = styled.div`
  line-height: 1.8;
  font-size: 1.1rem;
  color: white;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

  export const StoryImage = styled.img`
  max-width: 100%;
  max-height: 60vh;
  width: auto;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  object-fit: contain;
`;

  export const ImagePlaceholder = styled.div`
  width: 100%;
  max-height: 60vh;
  min-height: 300px;
  background: #e9ecef;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
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
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 1001;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    bottom: 15px;
    left: 15px;
    right: 15px;
    padding: 12px;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  @media (max-width: 480px) {
    bottom: 10px;
    left: 10px;
    right: 10px;
    padding: 10px;
    gap: 8px;
    justify-content: center;
  }
`;

  export const NavButton = styled.button<{ disabled?: boolean }>`
  padding: 10px 20px;
  background: ${props => props.disabled ? '#e9ecef' : '#007bff'};
  color: ${props => props.disabled ? '#666' : 'white'};
  border: none;
  border-radius: 5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.disabled ? '#e9ecef' : '#0056b3'};
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    justify-content: center;
    gap: 0;
  }
`;

  export const NavButtonText = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

  export const NavButtonIcon = styled.span`
  display: none;
  font-size: 1.2rem;
  font-weight: bold;

  @media (max-width: 768px) {
    display: block;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  margin: 10px 0;
  text-align: center;
  color: #666;
`;

  export const LoadingSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  `;

  export const LoadingStep = styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'active' && prop !== 'completed',
  })<{ active?: boolean; completed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: ${props => props.active ? '#e3f2fd' : props.completed ? '#e8f5e9' : '#f5f5f5'};
  border-radius: 8px;
  border-left: 4px solid ${props => props.active ? '#2196f3' : props.completed ? '#4caf50' : '#ccc'};
  transition: all 0.3s ease;
  `;

  export const StepNumber = styled.div<{ completed?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.completed ? '#4caf50' : '#2196f3'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
  `;

  export const StepContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  `;

  export const StepText = styled.div`
  font-size: 0.95rem;
  color: #333;
  font-weight: ${props => props.children?.toString().includes('Creating') ? '500' : '400'};
  `;

  export const PreviewButton = styled.button`
  background: transparent;
  color: #4caf50;
  border: 2px solid #4caf50;
  border-radius: 5px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;

  &:active {
    transform: scale(0.95);
  }
  `;

  export const StoryPreviewModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  `;

  export const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  `;

  export const ModalContent = styled.div`
  position: relative;
  background: white;
  border-radius: 15px;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  `;

  export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  `;

  export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  `;

  export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
  `;

  export const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  `;

  export const PreviewStoryContent = styled.div`
  line-height: 1.8;
  color: #333;
  `;

  export const PreviewParagraph = styled.p`
  margin: 0 0 20px 0;
  font-size: 1rem;
  text-align: justify;

  &:last-child {
    margin-bottom: 0;
  }
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

  export const CheckboxLabel = styled.label.withConfig({
    shouldForwardProp: (prop) => prop !== 'inactive',
  })<{ inactive?: boolean }>`
  color: ${props => props.inactive ? '#9aa0a6' : '#333'};
  cursor: pointer;
  transition: color 0.2s ease;
  `;

  // Advanced Form Components
  export const ModeToggle = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  `;

  export const ModeButton = styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'active',
  })<{ active: boolean }>`
    padding: 8px 16px;
    border: 2px solid ${props => props.active ? '#007bff' : '#ddd'};
    background: ${props => props.active ? '#007bff' : 'transparent'};
    color: ${props => props.active ? 'white' : '#333'};
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      border-color: #007bff;
      background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
    }
  `;

  export const AdvancedForm = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
  `;

  export const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;

  export const FormLabel = styled.label`
    font-weight: 600;
    color: #333;
    font-size: 16px;
  `;

  export const FormExample = styled.span`
    font-size: 12px;
    color: #666;
    font-style: italic;
  `;

  export const FormInput = styled.input`
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: #007bff;
    }

    &::placeholder {
      color: #999;
    }
  `;

  export const FormError = styled.div`
    color: #dc3545;
    font-size: 12px;
    margin-top: 4px;
  `;

  // Download Button
  export const DownloadButton = styled.button`
    background: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
      background: #218838;
    }

    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  `;

  // Toggle Switch (inspired by W3Schools switch)
  export const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .2s ease;
  border-radius: 999px;

  &::before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .2s ease;
    border-radius: 50%;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }
  `;

  export const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  input:checked + ${ToggleSlider} {
    background-color: #2196F3;
  }

  input:focus + ${ToggleSlider} {
    box-shadow: 0 0 1px #2196F3;
  }

  input:checked + ${ToggleSlider}::before {
    transform: translateX(20px);
  }
  `;

  // Language Toggle
  export const LanguageToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

  export const LanguageButton = styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'active',
  })<{ active: boolean }>`
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
