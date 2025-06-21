# AI-Powered Mind Map Generator

![AI Mind Map Generator](https://mindmapai-1-89h7.onrender.com)

An advanced web application that uses AI to generate structured, visually appealing mind maps from any topic or text input. The application utilizes multiple AI providers with support for OpenAI, Anthropic, Gemini, and Cohere models, and features secure API key management and user authentication.

## 🌟 Features

- **Multiple AI Providers**: Support for OpenAI, Anthropic, Gemini, and Cohere models
- **Custom API Key Integration**: Use your own API keys securely stored in your account
- **User Authentication**: Secure login/signup system with persistent sessions
- **Research Mode**: Enhances mind maps with web search results and deeper analysis
- **Interactive Visualization**: Zoom, pan, and explore your mind maps with intuitive controls
- **PDF Export**: Export your mind maps as high-quality PDF documents
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices
- **Real-time Generation**: Create complex mind maps in seconds

## 🚀 Live Demo

[Coming Soon!](#)

## 🛠️ Tech Stack

### Frontend
- React with React Router
- Mermaid.js for mind map visualization
- Axios for API communication
- Supabase for authentication and database
- Modern UI with responsive design

### Backend
- FastAPI (Python)
- Supabase PostgreSQL database integration
- Multiple LLM API integrations (OpenAI, Anthropic, Gemini, Cohere)
- Custom mind map formatting engine

## 📋 Installation

### Prerequisites
- Node.js (v14+)
- Python (v3.7+)
- Supabase account and project
- API keys for:
  - OpenAI (optional)
  - Anthropic (optional)
  - Google Gemini (optional)
  - Cohere (optional)
  - Serper (for research mode)

### Setup Steps

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/Mind-Map.git
   cd Mind-Map
   ```

2. **Backend Setup**
   ```
   cd backend
   pip install -r requirements.txt
   ```
   
   Create a `.env` file in the backend directory with your API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   MISTRAL_API_KEY=your_mistral_api_key_here
   SERPER_API_KEY=your_serper_api_key_here
   ```

3. **Frontend Setup**
   ```
   cd ../frontend
   npm install
   ```

4. **Supabase Setup**
   - Create a new Supabase project
   - Run the SQL scripts in `frontend/src/sql/api_key_functions.sql` in the Supabase SQL Editor
   - Update the Supabase URL and anon key in `frontend/src/supabase.js`

5. **Start the development server**
   ```
   npm run dev
   ```
   This will start both the backend (http://localhost:8000) and frontend (http://localhost:3000) servers.

## 🔒 Authentication and API Keys

The application features a complete authentication system:
- User signup/login with email and password
- Secure storage of user API keys in Supabase PostgreSQL
- Row-level security policies to protect user data
- API key validation before use
- Visual indicators showing whether using personal or system API keys

## 🧠 How It Works

1. User enters a topic or pastes text on the frontend
2. Users can choose to use their own API keys or the system default
3. The application can operate in two modes:
   - **Standard Mode**: Direct processing using the selected AI provider
   - **Research Mode**: Web-enhanced processing with deeper analysis
4. The backend processes the request and generates a structured data format
5. The mind map formatter converts the data into Mermaid.js syntax
6. The frontend renders the mind map with interactive controls

## 🔍 API Endpoints

- `GET /` - Status check
- `GET /debug` - API key validation (masked for security)
- `POST /generate_map` - Generate mind map from text

## 🔧 Customization

You can customize various aspects of the mind map generation:
- Update the styling in `mermaid_formatter.py`
- Modify the AI prompts in `nlp_service.py`
- Adjust the visualization options in `MindMap.js`
- Customize the authentication flow in `AuthContext.js`

## 📝 License

[MIT License](LICENSE)

## 👏 Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Mermaid.js](https://mermaid-js.github.io/mermaid/)
- [Supabase](https://supabase.com/)
- [Google Gemini API](https://ai.google.dev/)
- [OpenAI API](https://openai.com/api/)
- [Anthropic Claude API](https://www.anthropic.com/)
- [Cohere API](https://cohere.com/)
- [Mistral AI](https://mistral.ai/) 
