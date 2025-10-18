# React AI Chat App

A modern React web application with Google Generative AI integration, built with TypeScript and styled-components.

## Features

- 🤖 **Google Generative AI Integration** - Powered by @google/generative-ai
- 💬 **Real-time Chat Interface** - Interactive chat with AI assistant
- 🎨 **Modern UI Design** - Beautiful gradient design with styled-components
- 📱 **Responsive Layout** - Works on desktop and mobile devices
- ⚡ **TypeScript Support** - Full type safety and better development experience
- 🔒 **Secure API Key Handling** - Local API key management

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 14 or higher)
- npm or yarn
- A Google AI API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation

1. **Clone or download the project**
   ```bash
   cd react-ai-chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application.

## Getting Your Google AI API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Paste it into the application when prompted

## Usage

1. **Launch the app** - Run `npm start` and open `http://localhost:3000`
2. **Enter API Key** - Paste your Google AI API key in the input field
3. **Start Chatting** - Type your message and press Enter or click Send
4. **Enjoy the conversation** - The AI will respond to your queries in real-time

## Project Structure

```
src/
├── components/
│   └── AIChat.tsx          # Main chat component with AI integration
├── App.tsx                 # Main app component
├── App.css                 # Global styles
├── index.tsx               # App entry point
└── ...
```

## Key Components

### AIChat Component
- **Styled Components**: Modern, responsive design with gradient backgrounds
- **Message Management**: Real-time message display with user/AI distinction
- **API Integration**: Seamless Google Generative AI integration
- **Loading States**: Visual feedback during AI processing
- **Error Handling**: Graceful error handling for API issues

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Technologies Used

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Styled Components** - CSS-in-JS styling
- **Google Generative AI** - AI conversation capabilities
- **Create React App** - Development tooling

## Customization

### Styling
The app uses styled-components for styling. You can customize the appearance by modifying the styled components in `src/components/AIChat.tsx`:

- `ChatContainer` - Main container styling
- `ChatBox` - Chat interface container
- `Message` - Individual message styling
- `Input` - Input field styling
- `SendButton` - Send button styling

### AI Model
The app currently uses the `gemini-pro` model. You can change this in the `sendMessage` function:

```typescript
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
```

## Security Notes

- API keys are stored locally in the browser and not transmitted to any external servers
- The API key is only used to communicate directly with Google's AI services
- Consider implementing environment variables for production deployments

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Ensure your API key is valid and active
   - Check that you have access to the Google AI services
   - Verify the API key is correctly copied (no extra spaces)

2. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that you're using Node.js version 14 or higher

3. **Styling Issues**
   - Ensure styled-components is properly installed
   - Check browser console for any CSS-related errors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the Google AI documentation
3. Open an issue in the project repository

---

**Happy Chatting! 🤖💬**