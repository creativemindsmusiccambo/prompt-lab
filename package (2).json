# 🚀 Deploy to GitHub Pages (Complete Guide)

This guide walks you through hosting your Prompt Lab on GitHub Pages with a free backend for AI features.

---

## 📋 Overview

| Component | Hosting | Cost |
|-----------|---------|------|
| **Frontend** | GitHub Pages | **FREE** |
| **Backend** | Render.com | **FREE** |
| **AI API** | Google Gemini | **FREE** |

---

## Step 1: Push to GitHub

### 1.1 Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `prompt-lab` (or any name)
3. Make it **Public**
4. Click **Create repository**

### 1.2 Upload Your Files

**Option A: Using Git (Recommended)**

```bash
# Navigate to your project folder
cd /mnt/okcomputer/output/prompt-lab

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repo as remote (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/prompt-lab.git

# Push
git push -u origin main
```

**Option B: Upload via Web**

1. On your GitHub repo page, click **"uploading an existing file"**
2. Drag and drop all files from `/mnt/okcomputer/output/prompt-lab`
3. Click **Commit changes**

---

## Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select **GitHub Actions**
5. The workflow file (`.github/workflows/deploy.yml`) will auto-deploy!

### Your Live URL

After deployment (takes ~2-3 minutes), your app will be at:
```
https://YOUR_USERNAME.github.io/prompt-lab
```

---

## Step 3: Get FREE Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your key (starts with `AIzaSy...`)
5. **Save it somewhere safe** - you'll need it for the backend

---

## Step 4: Deploy Backend (Render.com - FREE)

### 4.1 Sign Up

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 4.2 Create Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `prompt-lab-api` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

### 4.3 Add Environment Variables

1. Click **Advanced** → **Add Environment Variable**
2. Add:
   - `GEMINI_API_KEY` = your API key from Step 3
3. Click **Create Web Service**

### 4.4 Wait for Deployment

- Takes ~2-5 minutes
- You'll get a URL like: `https://prompt-lab-api.onrender.com`
- **Copy this URL!**

---

## Step 5: Connect Frontend to Backend

1. Open your GitHub Pages app: `https://YOUR_USERNAME.github.io/prompt-lab`
2. Click the **🔌 AI** button (top action bar)
3. Paste your Render backend URL:
   ```
   https://prompt-lab-api.onrender.com
   ```
4. Click **Save Backend URL**
5. Reload the page

---

## Step 6: Test AI Features

1. Go to any tab (Music, Video, etc.)
2. Select **✨ Gemini (Free)** as AI provider
3. Click **"✨ AI Generate (Enhanced)"**
4. You should see AI-generated content! 🎉

---

## 🔧 Troubleshooting

### "AI Error" or "Backend not configured"

| Problem | Solution |
|---------|----------|
| Wrong backend URL | Check the URL in 🔌 AI settings |
| Backend sleeping | Free Render apps sleep after 15min - just wait 30s |
| CORS error | Make sure backend URL matches exactly |

### GitHub Pages Not Updating

1. Go to **Actions** tab in your repo
2. Check if the workflow succeeded
3. Clear browser cache (Ctrl+Shift+R)

### Backend Not Responding

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Check if your service is running
3. View logs for errors

---

## 🆓 Free Tier Limits

| Service | Limit |
|---------|-------|
| **GitHub Pages** | 1GB storage, 100GB bandwidth/month |
| **Render Free** | 512MB RAM, sleeps after 15min idle |
| **Gemini Free** | 60 requests/minute |

---

## 🔄 Updating Your App

After making changes:

```bash
git add .
git commit -m "Your changes"
git push
```

GitHub Actions will auto-deploy! 🚀

---

## 📁 File Structure on GitHub

```
prompt-lab/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploy to GitHub Pages
├── server/
│   ├── server.js               # Backend API
│   ├── package.json            # Dependencies
│   ├── .env.example            # API key template
│   └── README.md               # Backend docs
├── index.html                  # Main app
├── README.md                   # Main docs
├── DEPLOY.md                   # This file
└── ...
```

---

## 🎯 Quick Reference

| Task | Command/URL |
|------|-------------|
| **Live App** | `https://YOUR_USERNAME.github.io/prompt-lab` |
| **Backend** | `https://prompt-lab-api.onrender.com` |
| **Gemini Key** | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| **Deploy Status** | GitHub → Actions tab |

---

## 💡 Tips

1. **Backend sleeps?** First request after idle will be slow (~30s). Subsequent requests are fast.

2. **Want faster backend?** Upgrade Render to Starter ($7/month) - no sleeping.

3. **Multiple users?** The backend handles all users with the same API key.

4. **Security?** API keys are safely on the backend, never in browser.

---

**🎉 You're all set! Enjoy your AI-powered Prompt Lab!**

Need help? Check the [main README](README.md) or open an issue on GitHub.
