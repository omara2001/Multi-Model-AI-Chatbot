# Multi-Model AI Chatbot

A versatile AI chatbot application that allows users to interact with multiple open-source AI models through a single, unified interface. Built with FastAPI for the backend and vanilla HTML, CSS, and JavaScript for the frontend.

## 🌟 Features

- **Multiple AI Models**: Access to various open-source models like Llama 3, Mistral, Mixtral, DeepSeek, UI-TARS, Qwen, and Phi-3
- **Elegant UI**: Beautiful, responsive interface with dark/light mode toggle
- **Real-time Chat**: Smooth, animated chat experience with typing indicators
- **Markdown Support**: Full markdown rendering for rich text responses
- **Code Highlighting**: Syntax highlighting for code snippets in responses
- **Mobile-Friendly**: Fully responsive design that works on all devices
- **Theme Switching**: Toggle between dark and light themes with persistent preferences
- **Chat History**: Save, name, and revisit previous conversations
- **Voice Input/Output**: Speak to the AI and hear responses with text-to-speech
- **Export/Import**: Save your conversations and settings for backup or transfer
- **Keyboard Shortcuts**: Navigate quickly with keyboard commands
- **Settings Panel**: Customize voice, appearance, and behavior

## 🛠️ Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **OpenRouter API**: Gateway to multiple AI models
- **Python 3.9+**: Modern Python features
- **Railway**: Deployment platform

### Frontend
- **Vanilla JavaScript**: No frameworks, just pure JS
- **Modern CSS**: CSS variables, animations, and responsive design
- **HTML5**: Semantic markup
- **Font Awesome**: Icons
- **Marked.js**: Markdown parsing
- **Highlight.js**: Code syntax highlighting
- **Web Speech API**: Voice recognition and text-to-speech

## 📋 Getting Started

### Prerequisites

- Python 3.9 or higher
- An OpenRouter API key (get one at [https://openrouter.ai/keys](https://openrouter.ai/keys))

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/omara2001/Multi-Model-AI-Chatbot.git
   cd Multi-Model-AI-Chatbot
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file with your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

6. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

7. The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Open `script.js` and update the API URL if needed:
   ```javascript
   const API_URL = 'http://localhost:8000';  // For local development
   // const API_URL = 'https://multi-model-ai-chatbot-production.up.railway.app';  // For production
   ```

3. Open the `index.html` file in your browser:
   - Double-click the file to open it directly
   - Or use a simple HTTP server:
     ```bash
     # Python 3
     python -m http.server
     
     # Then open http://localhost:8000 in your browser
     ```

## 🚢 Deployment

### Backend Deployment

1. Create a new project on [Railway](https://railway.app/)
2. Connect your GitHub repository
3. Set the following environment variables:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
4. Railway will automatically detect the Python project and deploy it

### Frontend Deployment

1. For the simple HTML/CSS/JS frontend, you can deploy to any static hosting service:
   - GitHub Pages
   - Netlify
   - Vercel
   - Railway static deployments

2. Make sure to update the API_URL in `frontend/script.js` to point to your deployed backend URL:
   ```javascript
   const API_URL = 'https://your-backend-url.railway.app';
   ```

## 🧠 Available Models

The application supports various open-source models through OpenRouter:

- **Llama 3 8B**: Meta's efficient open-source model
- **Mistral 7B**: Mistral AI's efficient instruction-following model
- **Mixtral 8x7B**: Mistral AI's mixture of experts model
- **DeepSeek V3**: DeepSeek's 685B-parameter mixture-of-experts model
- **UI-TARS 72B**: Bytedance's model for advanced text analysis
- **Qwen3 4B**: Alibaba's 4B model with 128K context window
- **Phi-3 Mini**: Microsoft's compact but powerful open-source model
- **Llama 3 70B**: Meta's powerful large language model (may require credits)

## ⌨️ Keyboard Shortcuts

- **Ctrl+Enter**: Send message
- **Ctrl+N**: New chat
- **Ctrl+S**: Save chat
- **Ctrl+,**: Open settings
- **Ctrl+M**: Toggle voice input
- **Escape**: Close modals and panels

## 🔊 Voice Features

- **Text-to-Speech**: Hear AI responses read aloud
- **Speech Recognition**: Speak to the AI instead of typing
- **Voice Settings**: Choose from available system voices
- **Customization**: Adjust speech rate and pitch

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [OpenRouter](https://openrouter.ai/) for providing access to multiple AI models
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Marked.js](https://marked.js.org/) for markdown parsing
- [Highlight.js](https://highlightjs.org/) for code syntax highlighting
- [Font Awesome](https://fontawesome.com/) for icons
- [Railway](https://railway.app/) for deployment
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for voice features
