const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// ==========================================
// PORT CONFIGURATION - CRITICAL FOR RENDER
// ==========================================
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0'; // MUST bind to all interfaces for Render

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// ==========================================
// ROUTES
// ==========================================

// Root route
app.get('/', (req, res) => {
    res.json({
        status: '✅ Prompt Lab API is running',
        version: '1.0.0',
        port: PORT,
        endpoints: {
            health: '/api/health',
            generate: 'POST /api/generate'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!', port: PORT });
});

// ==========================================
// MAIN AI GENERATION ENDPOINT
// ==========================================
app.post('/api/generate', async (req, res) => {
    console.log('📥 Received request:', req.body);
    
    try {
        const { type, params, provider } = req.body;
        
        if (!type || !params) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: type, params' 
            });
        }
        
        // Template mode - return fallback flag
        if (!provider || provider === 'template') {
            return res.json({ 
                success: false, 
                message: 'Template mode - use frontend fallback',
                useFallback: true
            });
        }
        
        let result;
        
        switch(provider) {
            case 'gemini':
                result = await generateWithGemini(type, params);
                break;
            case 'openai':
                result = await generateWithOpenAI(type, params);
                break;
            default:
                return res.status(400).json({ 
                    success: false, 
                    error: `Unknown provider: ${provider}` 
                });
        }
        
        console.log('✅ Generation successful');
        res.json({ success: true, prompt: result });
        
    } catch (error) {
        console.error('❌ Generation error:', error.message);
        res.json({ 
            success: false, 
            error: error.message,
            useFallback: true
        });
    }
});

// ==========================================
// AI PROVIDERS
// ==========================================

async function generateWithGemini(type, params) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }
    
    const prompt = buildPrompt(type, params);
    
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );
        
        if (!response.data.candidates || !response.data.candidates[0]) {
            throw new Error('No response from Gemini API');
        }
        
        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        throw new Error('Gemini API failed: ' + (error.response?.data?.error?.message || error.message));
    }
}

async function generateWithOpenAI(type, params) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY not configured');
    }
    
    const prompt = buildPrompt(type, params);
    
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are an expert prompt engineer.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.8,
                max_tokens: 1000
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API error:', error.response?.data || error.message);
        throw new Error('OpenAI API failed: ' + (error.response?.data?.error?.message || error.message));
    }
}

function buildPrompt(type, params) {
    const builders = {
        music: (p) => `Create a detailed AI music generation prompt for ${p.genre} genre.
BPM: ${p.bpm}, Mood: ${p.mood}
Keywords: ${p.keywords || 'none'}
Make it suitable for Suno, Udio, or similar AI music tools.`,

        lyrics: (p) => `Write song lyrics in ${p.genre} style.
Topic: ${p.topic || 'general theme'}
Mood: ${p.mood}, Structure: ${p.structure}
Keywords: ${p.keywords || 'none'}`,

        image: (p) => `Create an optimized AI image generation prompt.
Style: ${p.style}
Subject: ${p.subject || 'creative composition'}
Lighting: ${p.lighting}, Ratio: ${p.ratio}`,

        video: (p) => `Create a detailed AI video generation prompt.
Style: ${p.style}
Subject: ${p.subject || 'cinematic scene'}
Camera: ${p.camera || 'various shots'}, Mood: ${p.mood}`,

        education: (p) => `Create educational content.
Type: ${p.type}, Topic: ${p.topic || 'general subject'}
Level: ${p.level}, Tone: ${p.tone}`,

        esl: (p) => `Create ESL learning material.
Proficiency: ${p.proficiency}, Content Type: ${p.contentType}
Native Language: ${p.nativeLang}, Focus: ${p.focus}`,

        keywords: (p) => `Optimize this prompt for AI tools:
Topic: ${p.topic}
Keywords: ${p.keywords || 'none'}
Style: ${p.style}, Length: ${p.length}`
    };
    
    const builder = builders[type];
    if (!builder) throw new Error(`Unknown type: ${type}`);
    return builder(params);
}

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        error: 'Not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: err.message });
});

// ==========================================
// START SERVER - CRITICAL PORT BINDING
// ==========================================
app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`📡 Environment PORT: ${process.env.PORT || 'not set (using default 3000)'}`);
    console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🧠 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
});
