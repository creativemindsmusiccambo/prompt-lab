const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors({
    origin: '*', // Allow all origins for now
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// ==========================================
// ROUTES
// ==========================================

// Root route - fix for "Cannot GET /"
app.get('/', (req, res) => {
    res.json({
        status: '✅ Prompt Lab API is running',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            generate: 'POST /api/generate'
        },
        providers: ['gemini', 'openai', 'ollama', 'template']
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
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
        
        // Template mode - return error to trigger frontend fallback
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
            case 'ollama':
                result = await generateWithOllama(type, params);
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
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Internal server error',
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
        throw new Error('GEMINI_API_KEY not configured in environment variables');
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
        const errorMsg = error.response?.data?.error?.message || error.message;
        throw new Error(`Gemini API failed: ${errorMsg}`);
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

async function generateWithOllama(type, params) {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const prompt = buildPrompt(type, params);
    
    try {
        const response = await axios.post(
            `${ollamaUrl}/api/generate`,
            {
                model: process.env.OLLAMA_MODEL || 'llama2',
                prompt: prompt,
                stream: false
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            }
        );
        
        return response.data.response;
    } catch (error) {
        throw new Error('Ollama connection failed. Is Ollama running locally?');
    }
}

// ==========================================
// PROMPT BUILDERS
// ==========================================
function buildPrompt(type, params) {
    const builders = {
        music: (p) => `Create a detailed AI music generation prompt for ${p.genre} genre.
BPM: ${p.bpm}, Mood: ${p.mood}
Keywords: ${p.keywords || 'none'}
Make it suitable for Suno, Udio, or similar AI music tools. Include specific instructions about instruments, structure, and atmosphere.`,

        lyrics: (p) => `Write song lyrics in ${p.genre} style.
Topic: ${p.topic || 'general theme'}
Mood: ${p.mood}, Structure: ${p.structure}
Keywords to include: ${p.keywords || 'none'}
Include verses, chorus, and bridge. Make it emotionally resonant.`,

        image: (p) => `Create an optimized AI image generation prompt.
Style: ${p.style}
Subject: ${p.subject || 'creative composition'}
Lighting: ${p.lighting}, Ratio: ${p.ratio}
Make it detailed for Midjourney, DALL-E 3, or Stable Diffusion.`,

        video: (p) => `Create a detailed AI video generation prompt for Runway, Pika, or similar.
Style: ${p.style}
Subject: ${p.subject || 'cinematic scene'}
Camera: ${p.camera || 'various shots'}, Mood: ${p.mood}
Duration: ${p.duration}s, Quality: ${p.quality}
Include camera movements and visual details.`,

        education: (p) => `Create educational content.
Type: ${p.type}, Topic: ${p.topic || 'general subject'}
Level: ${p.level}, Tone: ${p.tone}
Make it structured and engaging for students.`,

        esl: (p) => `Create ESL (English as Second Language) learning material.
Proficiency: ${p.proficiency}, Content Type: ${p.contentType}
Native Language: ${p.nativeLang}, Focus: ${p.focus}
Context: ${p.context || 'general'}
Include translations or explanations where helpful.`,

        keywords: (p) => `Optimize this prompt for AI tools:
Topic: ${p.topic}
Keywords: ${p.keywords || 'none'}
Style: ${p.style}, Length: ${p.length}
Make it detailed and effective for getting best results from AI.`
    };
    
    const builder = builders[type];
    if (!builder) throw new Error(`Unknown prompt type: ${type}`);
    
    return builder(params);
}

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        error: 'Endpoint not found',
        available: ['GET /', 'GET /api/health', 'POST /api/generate']
    });
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Prompt Lab Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🧠 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
});
