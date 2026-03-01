const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Get port from Render (MUST use process.env.PORT)
const PORT = process.env.PORT || 10000;

// ==========================================
// API KEY SETUP
// ==========================================
// Option 1: Use environment variable (RECOMMENDED)
// const API_KEY = process.env.GEMINI_API_KEY;

// Option 2: Hardcode temporarily to test (REPLACE WITH YOUR NEW KEY)
const API_KEY = 'AIzaSy...REPLACE_WITH_YOUR_NEW_KEY_HERE';

if (!API_KEY || API_KEY.includes('REPLACE')) {
    console.error('❌ ERROR: No API key set!');
}

// ==========================================
// ROUTES
// ==========================================

// Health check (Render needs this)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get('/debug', (req, res) => {
    res.json({
        key_exists: !!API_KEY,
        key_preview: API_KEY ? API_KEY.substring(0, 10) + '...' : 'NONE',
        port: PORT
    });
});

// AI Generation
app.post('/api/generate', async (req, res) => {
    if (!API_KEY || API_KEY.includes('REPLACE')) {
        return res.status(500).json({ 
            success: false, 
            error: 'API key not configured',
            fix: 'Add GEMINI_API_KEY to environment variables or hardcode in server.js'
        });
    }

    try {
        const { prompt, type, genre } = req.body;
        
        const systemPrompt = `You are a creative assistant. Create a detailed ${genre} ${type} prompt.`;
        
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                contents: [{
                    parts: [{ text: `${systemPrompt}\n\nUser: ${prompt}` }]
                }]
            },
            { timeout: 15000 }
        );

        const result = response.data.candidates[0].content.parts[0].text;
        res.json({ success: true, result });

    } catch (error) {
        console.error('AI Error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Simple HTML Frontend
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI Prompt Lab</title>
            <style>
                body { font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; }
                button { padding: 15px; font-size: 16px; cursor: pointer; margin: 5px; }
                #result { margin-top: 20px; padding: 20px; background: #f0f0f0; border-radius: 5px; }
                .error { color: red; }
                .success { color: green; }
                input, select { width: 100%; padding: 10px; margin: 5px 0; }
            </style>
        </head>
        <body>
            <h1>🚀 AI Prompt Lab</h1>
            
            <div style="background: #e0e0e0; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <button onclick="checkDebug()">🔍 Check API Key</button>
                <div id="debug"></div>
            </div>
            
            <select id="type">
                <option value="image">Image</option>
                <option value="music">Music</option>
                <option value="character">Character</option>
            </select>
            
            <input type="text" id="genre" placeholder="Genre (e.g., cyberpunk, jazz)" value="cyberpunk">
            <input type="text" id="prompt" placeholder="Your description..." value="A futuristic city">
            
            <button onclick="generate()">✨ Generate</button>
            
            <div id="result"></div>

            <script>
                async function checkDebug() {
                    const res = await fetch('/debug');
                    const data = await res.json();
                    document.getElementById('debug').innerHTML = 
                        '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                }
                
                async function generate() {
                    const btn = document.querySelector('button[onclick="generate()"]');
                    btn.disabled = true;
                    btn.textContent = 'Loading...';
                    
                    try {
                        const res = await fetch('/api/generate', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                prompt: document.getElementById('prompt').value,
                                type: document.getElementById('type').value,
                                genre: document.getElementById('genre').value
                            })
                        });
                        const data = await res.json();
                        document.getElementById('result').innerHTML = 
                            '<div class="' + (data.success ? 'success' : 'error') + '">' + 
                            '<pre>' + JSON.stringify(data, null, 2) + '</pre>' +
                            '</div>';
                    } catch(e) {
                        document.getElementById('result').innerHTML = 
                            '<div class="error">Error: ' + e.message + '</div>';
                    }
                    
                    btn.disabled = false;
                    btn.textContent = '✨ Generate';
                }
            </script>
        </body>
        </html>
    `);
});

// ==========================================
// START SERVER (CRITICAL - MUST BIND TO 0.0.0.0)
// ==========================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔑 API Key: ${API_KEY ? 'Configured' : 'MISSING'}`);
});
