# AI Prompt Lab - Backend Server Setup

This backend server securely handles AI API calls so your API keys stay private.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure API Keys
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API keys
nano .env
```

### 3. Get Your Free API Keys

#### Google Gemini (FREE - Recommended)
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key to your `.env` file

#### OpenAI (Paid)
1. Go to https://platform.openai.com/api-keys
2. Create an account and add payment
3. Generate an API key
4. Copy the key to your `.env` file

### 4. Start the Server
```bash
# Production mode
npm start

# Development mode (auto-restart on changes)
npm run dev
```

The server will start on http://localhost:3000

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/gemini` | POST | Generate with Google Gemini (FREE) |
| `/api/openai` | POST | Generate with OpenAI GPT |
| `/api/ollama` | POST | Generate with local Ollama |

## 🔒 Security Benefits

- ✅ API keys never exposed to browser
- ✅ Keys stored only on server
- ✅ No risk of keys being stolen from browser storage
- ✅ Can add rate limiting and usage tracking

## 🌐 Deployment Options

### Option 1: Local Development
```bash
npm start
# Frontend: http://localhost:8080 (or your static server)
# Backend: http://localhost:3000
```

### Option 2: Deploy to Render.com (Free)
1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect your GitHub repo
5. Set environment variables in Render dashboard
6. Deploy!

### Option 3: Deploy to Railway (Free)
1. Push code to GitHub
2. Go to https://railway.app
3. Create new project from GitHub
4. Add environment variables
5. Deploy!

### Option 4: Deploy to VPS/Dedicated Server
```bash
# Using PM2 for process management
npm install -g pm2
pm2 start server.js --name "ai-prompt-lab"
pm2 save
pm2 startup
```

## 🛠️ Environment Variables

Create a `.env` file in the `/server` folder:

```env
# Required - Get free at https://makersuite.google.com
GEMINI_API_KEY=your_gemini_api_key_here

# Optional - Get at https://platform.openai.com
OPENAI_API_KEY=your_openai_api_key_here

# Optional - defaults to 3000
PORT=3000
```

## 🧪 Testing the Server

```bash
# Test if server is running
curl http://localhost:3000

# Test Gemini endpoint
curl -X POST http://localhost:3000/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"type":"image","prompt":"Create a prompt for a cyberpunk city"}'
```

## 🐛 Troubleshooting

### "Gemini API key not configured"
- Make sure you created the `.env` file
- Verify `GEMINI_API_KEY` is set correctly
- Restart the server after editing `.env`

### "CORS error" in browser
- Make sure the backend server is running
- Check that `API_BASE_URL` in the frontend matches your server URL

### "Ollama not running"
- Install Ollama from https://ollama.com
- Run `ollama run mistral` to start the model
- Keep the terminal window open

## 📞 Support

If you have issues:
1. Check server logs for errors
2. Verify your API keys are valid
3. Make sure all environment variables are set
