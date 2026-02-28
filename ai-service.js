// AI Prompt Lab Backend Server
// This keeps your API keys secure on the server side

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5500',  // Live Server
    // Add your GitHub Pages URL here after deployment:
    // 'https://yourusername.github.io'
];

// Allow all origins in development, specific in production
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Allow localhost and GitHub Pages
        if (allowedOrigins.includes(origin) || 
            origin.includes('localhost') || 
            origin.includes('127.0.0.1') ||
            origin.endsWith('.github.io')) {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'AI Prompt Lab Server Running', version: '1.0.0' });
});

// ============================================
// GEMINI API ENDPOINT (FREE)
// ============================================
app.post('/api/gemini', async (req, res) => {
    try {
        const { prompt, type } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured on server' });
        }

        const systemPrompts = {
            music: 'You are an expert music producer. Create detailed, creative prompts for AI music generation tools like Suno or Udio.',
            lyrics: 'You are a professional songwriter. Write compelling, original lyrics with proper structure.',
            image: 'You are an AI image generation expert. Create detailed prompts for Midjourney, DALL-E, or Stable Diffusion.',
            video: 'You are an AI video generation expert. Create detailed prompts for Runway, Pika, or Sora.',
            education: 'You are an experienced educator. Create engaging, accurate educational content.',
            esl: 'You are an ESL expert. Create effective language learning materials.',
            keywords: 'You are a prompt engineering specialist. Create optimized AI prompts.'
        };

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    role: 'user',
                    parts: [
                        { text: systemPrompts[type] || systemPrompts.keywords },
                        { text: `Now generate based on this request: ${prompt}` }
                    ]
                }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 1500,
                    topP: 0.9
                }
            }
        );

        const generatedText = response.data.candidates[0].content.parts[0].text;
        res.json({ success: true, result: generatedText });

    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Gemini API error', 
            details: error.response?.data?.error?.message || error.message 
        });
    }
});

// ============================================
// OPENAI API ENDPOINT
// ============================================
app.post('/api/openai', async (req, res) => {
    try {
        const { prompt, type } = req.body;
        
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured on server' });
        }

        const systemPrompts = {
            music: 'You are an expert music producer. Create detailed, creative prompts for AI music generation tools like Suno or Udio.',
            lyrics: 'You are a professional songwriter. Write compelling, original lyrics with proper structure.',
            image: 'You are an AI image generation expert. Create detailed prompts for Midjourney, DALL-E, or Stable Diffusion.',
            video: 'You are an AI video generation expert. Create detailed prompts for Runway, Pika, or Sora.',
            education: 'You are an experienced educator. Create engaging, accurate educational content.',
            esl: 'You are an ESL expert. Create effective language learning materials.',
            keywords: 'You are a prompt engineering specialist. Create optimized AI prompts.'
        };

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompts[type] || systemPrompts.keywords },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.8,
                max_tokens: 1500
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const generatedText = response.data.choices[0].message.content;
        res.json({ success: true, result: generatedText });

    } catch (error) {
        console.error('OpenAI API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'OpenAI API error', 
            details: error.response?.data?.error?.message || error.message 
        });
    }
});

// ============================================
// OLLAMA (LOCAL AI) ENDPOINT
// ============================================
app.post('/api/ollama', async (req, res) => {
    try {
        const { prompt, type } = req.body;

        const systemPrompts = {
            music: 'You are an expert music producer. Create detailed, creative prompts for AI music generation.',
            lyrics: 'You are a professional songwriter. Write compelling, original lyrics.',
            image: 'You are an AI image generation expert. Create detailed prompts.',
            video: 'You are an AI video generation expert. Create detailed prompts.',
            education: 'You are an experienced educator. Create engaging educational content.',
            esl: 'You are an ESL expert. Create effective language learning materials.',
            keywords: 'You are a prompt engineering specialist.'
        };

        const response = await axios.post(
            'http://localhost:11434/api/generate',
            {
                model: 'mistral',
                prompt: `${systemPrompts[type] || systemPrompts.keywords}\n\n${prompt}`,
                stream: false
            }
        );

        res.json({ success: true, result: response.data.response });

    } catch (error) {
        console.error('Ollama Error:', error.message);
        res.status(500).json({ 
            error: 'Ollama not running', 
            details: 'Make sure Ollama is installed and running on localhost:11434' 
        });
    }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`🚀 AI Prompt Lab Server running on http://localhost:${PORT}`);
    console.log('');
    console.log('📋 Available endpoints:');
    console.log('  POST /api/gemini  - Google Gemini (Free)');
    console.log('  POST /api/openai  - OpenAI GPT');
    console.log('  POST /api/ollama  - Local Ollama');
    console.log('');
    console.log('🔑 Environment variables needed:');
    console.log('  GEMINI_API_KEY - Get free at https://makersuite.google.com');
    console.log('  OPENAI_API_KEY - Get at https://platform.openai.com');
});
