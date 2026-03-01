# 🎨 Creative Minds Prompt Lab

> AI Prompt Engineering Studio with Music, Lyrics, Images, Video, Education, and Keywords generators.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![GitHub Pages](https://img.shields.io/badge/deployed-GitHub%20Pages-brightgreen)

## 🚀 Live Demo

**[View Live App](https://yourusername.github.io/prompt-lab)** ← Replace with your actual URL after deployment

## ✨ Features

- 🎵 **Music Generator** - Create prompts for AI music tools (Suno, Udio)
- 🎤 **Lyrics Writer** - Generate song lyrics with structure
- 🎨 **Image Prompts** - Create detailed prompts for Midjourney, DALL-E
- 🎬 **Video Generator** - Prompts for Runway, Pika, Sora
- 📚 **Education** - Lesson plans, quizzes, ESL materials
- 🔑 **Keywords** - Optimize prompts for any AI tool
- 👤 **Character Design** - Generate male/female character prompts

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **AI APIs**: Google Gemini (Free), OpenAI, Ollama (Local)
- **Hosting**: GitHub Pages (Frontend) + Render/Railway (Backend)

## 📁 Project Structure

```
prompt-lab/
├── index.html              # Main app
├── README.md               # This file
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages auto-deploy
└── server/                 # Backend server
    ├── server.js           # Express server
    ├── package.json        # Dependencies
    ├── .env.example        # API key template
    └── README.md           # Backend setup guide
```

## 🚀 Quick Start (GitHub Pages)

### 1. Fork This Repository

Click the **Fork** button at the top right of this page.

### 2. Enable GitHub Pages

1. Go to your forked repository
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The app will auto-deploy on every push!

### 3. Your Live URL

After deployment, your app will be at:
```
https://yourusername.github.io/prompt-lab
```

## 🔗 Connect to AI (Backend Setup)

GitHub Pages only hosts static files. For AI features, you need a backend:

### Option A: Deploy Backend to Render (FREE)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → Sign up
3. Click **New +** → **Web Service**
4. Connect your GitHub repo
5. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variable:
   - `GEMINI_API_KEY` = your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
7. Click **Deploy**

### Option B: Deploy Backend to Railway (FREE)

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Add environment variables
4. Deploy!

### Option C: Run Backend Locally

```bash
cd server
npm install

# Create .env file with your API key
echo "GEMINI_API_KEY=your_key_here" > .env

npm start
# Backend runs on http://localhost:3000
```

## 🔑 Get Your FREE Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google
3. Click **"Create API Key"**
4. Copy the key (starts with `AIzaSy...`)
5. Add to your backend environment variables

## 🆓 Free vs Paid AI Options

| Provider | Cost | Rate Limits |
|----------|------|-------------|
| **Google Gemini** | **FREE** | 60 requests/minute |
| **Ollama (Local)** | **FREE** | Unlimited (runs on your PC) |
| OpenAI GPT-3.5 | ~$0.002/1K tokens | Pay per use |

## 🎨 Customization

### Change Colors/Theme

Edit CSS variables in `index.html`:

```css
:root {
    --neon-cyan: #00f5ff;
    --neon-purple: #b829dd;
    --neon-pink: #ff2d95;
    /* ... */
}
```

### Add New Generators

1. Add a new tab button in the HTML
2. Create the tab content section
3. Add JavaScript functions for generation

## 🐛 Troubleshooting

### "AI Error" when generating
- Make sure backend server is running
- Check that `GEMINI_API_KEY` is set correctly
- Verify backend URL matches your deployed URL

### GitHub Pages not updating
- Go to **Actions** tab in your repo
- Check if the workflow ran successfully
- Clear browser cache and reload

### CORS errors
- Backend must allow requests from your GitHub Pages domain
- Update CORS settings in `server/server.js`

## 📜 License

MIT License - feel free to use, modify, and distribute!

## 🙏 Credits

- Fonts: [Google Fonts](https://fonts.google.com) (Orbitron, Rajdhani)
- Icons: Emoji set
- AI: Google Gemini, OpenAI

---

**Made with ❤️ by [Your Name]**

⭐ Star this repo if you find it useful!
