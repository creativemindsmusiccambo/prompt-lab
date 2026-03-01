const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Prompt Lab API is running' });
});

// ==========================================
// MAIN AI GENERATION ENDPOINT
// ==========================================
app.post('/api/generate', async (req, res) => {
    try {
        const { type, params, provider } = req.body;
        
        console.log(`Generating ${type} with ${provider}...`);
        
        // If template-only mode, return null to trigger fallback
        if (provider === 'template') {
            return res.json({ success: false, message: 'Template mode - use frontend fallback' });
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
                return res.status(400).json({ success: false, error: 'Unknown provider' });
        }
        
        res.json({ success: true, prompt: result });
        
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Internal server error' 
        });
    }
});

// ==========================================
// GEMINI (GOOGLE AI) - FREE TIER
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
                headers: { 'Content-Type': 'application/json' }
            }
        );
        
        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        throw new Error('Gemini API failed: ' + (error.response?.data?.error?.message || error.message));
    }
}

// ==========================================
// OPENAI (GPT)
// ==========================================
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
                }
            }
        );
        
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API error:', error.response?.data || error.message);
        throw new Error('OpenAI API failed: ' + (error.response?.data?.error?.message || error.message));
    }
}

// ==========================================
// OLLAMA (LOCAL)
// ==========================================
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
        console.error('Ollama error:', error.message);
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
        error: 'Internal server error' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Prompt Lab Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🧠 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
});
