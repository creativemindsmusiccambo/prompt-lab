const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ==========================================
// STEP 1: BIND TO PORT IMMEDIATELY (CRITICAL)
// ==========================================
const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ Server running on port', PORT);
});

// ==========================================
// STEP 2: SETUP MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public')); // Serve static files if you have them

// ==========================================
// STEP 3: API KEY (Use env var or hardcode temporarily)
// ==========================================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.log('⚠️ WARNING: GEMINI_API_KEY not set in environment variables');
    console.log('Add it in Render Dashboard → Environment');
}

// ==========================================
// STEP 4: ROUTES
// ==========================================

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        ai_configured: !!GEMINI_API_KEY,
        timestamp: new Date().toISOString() 
    });
});

// Debug endpoint
app.get('/debug', (req, res) => {
    res.json({
        key_exists: !!GEMINI_API_KEY,
        key_preview: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT SET',
        port: PORT,
        env_vars: Object.keys(process.env).filter(k => k.includes('GEMINI'))
    });
});

// AI Generation Endpoint
app.post('/api/generate', async (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ 
            success: false, 
            error: 'API key not configured',
            instructions: 'Add GEMINI_API_KEY to Render Environment Variables'
        });
    }

    try {
        const { prompt, type, genre } = req.body;
        
        const systemPrompt = getSystemPrompt(type, genre);
        
        console.log('Generating AI response...');
        
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: `${systemPrompt}\n\nUser request: ${prompt}` }]
                }]
            },
            { timeout: 15000 }
        );

        const result = response.data.candidates[0].content.parts[0].text;
        
        res.json({ success: true, result });

    } catch (error) {
        console.error('AI Error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: 'AI generation failed',
            details: error.message 
        });
    }
});

// Image Analysis Endpoint
app.post('/api/analyze-image', async (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ success: false, error: 'API key not configured' });
    }

    try {
        const { imageBase64 } = req.body;
        
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [
                        { text: "Create a detailed AI art prompt to recreate this image. Include style, lighting, mood, and composition details." },
                        { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                    ]
                }]
            },
            { timeout: 20000 }
        );

        const description = response.data.candidates[0].content.parts[0].text;
        res.json({ success: true, description });

    } catch (error) {
        console.error('Image Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Frontend
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Prompt Lab</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', sans-serif; 
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    color: #fff; 
                    min-height: 100vh;
                    padding: 20px;
                }
                .container { max-width: 800px; margin: 0 auto; }
                h1 { 
                    text-align: center; 
                    font-size: 2.5rem;
                    background: linear-gradient(45deg, #00d4ff, #7b2cbf);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 30px;
                }
                .panel { 
                    background: rgba(255,255,255,0.05); 
                    padding: 25px; 
                    border-radius: 15px; 
                    margin-bottom: 20px;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                select, textarea, input, button { 
                    width: 100%; 
                    padding: 12px; 
                    margin: 8px 0; 
                    border-radius: 8px; 
                    border: 1px solid rgba(255,255,255,0.2);
                    background: rgba(0,0,0,0.3);
                    color: #fff;
                    font-size: 16px;
                }
                button { 
                    background: linear-gradient(45deg, #00d4ff, #7b2cbf);
                    border: none;
                    font-weight: bold;
                    cursor: pointer;
                    text-transform: uppercase;
                }
                button:hover { opacity: 0.9; }
                .status { 
                    padding: 15px; 
                    background: rgba(0,0,0,0.3); 
                    border-radius: 8px; 
                    margin-bottom: 20px;
                }
                .error { color: #ff4757; }
                .success { color: #2ed573; }
                #result { 
                    background: rgba(0,0,0,0.4); 
                    padding: 20px; 
                    border-radius: 10px; 
                    margin-top: 20px;
                    white-space: pre-wrap;
                    border-left: 3px solid #00d4ff;
                }
                .upload-area {
                    border: 2px dashed rgba(0,212,255,0.3);
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px;
                    cursor: pointer;
                }
                .upload-area:hover { border-color: #00d4ff; background: rgba(0,212,255,0.05); }
                input[type="file"] { display: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 AI Prompt Lab</h1>
                
                <div class="panel status">
                    <button onclick="checkStatus()" style="width: auto; padding: 10px 20px;">🔍 Check API Status</button>
                    <div id="status-result"></div>
                </div>
                
                <div class="panel">
                    <select id="type" onchange="updateGenres()">
                        <option value="image">🎨 AI Art / Image</option>
                        <option value="music">🎵 Music Production</option>
                        <option value="character">👤 Character Design</option>
                        <option value="video">🎬 Video Production</option>
                        <option value="esl">📚 ESL / Education</option>
                    </select>
                    
                    <select id="genre">
                        <option value="">Select style...</option>
                    </select>
                    
                    <textarea id="prompt" rows="3" placeholder="Describe what you want to create...">A futuristic cyberpunk city at night with neon lights</textarea>
                    
                    <button onclick="generate()">✨ Generate AI Prompt</button>
                </div>
                
                <div class="panel upload-area" onclick="document.getElementById('file').click()">
                    <input type="file" id="file" accept="image/*" onchange="analyzeImage(event)">
                    📤 Upload Image for Analysis
                </div>
                
                <div id="result"></div>
            </div>

            <script>
                const genres = {
                    image: ['Photorealistic', 'Anime', 'Digital Art', 'Oil Painting', '3D Render', 'Cyberpunk', 'Watercolor'],
                    music: ['Hip Hop', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Drum & Bass', 'Trance', 'House'],
                    character: ['Realistic', 'Anime', 'Cartoon', 'Concept Art', 'Pixel Art', 'Chibi'],
                    video: ['Cinematic', 'Documentary', 'Music Video', 'Commercial', 'Animation'],
                    esl: ['Beginner', 'Intermediate', 'Advanced', 'Business English']
                };
                
                function updateGenres() {
                    const type = document.getElementById('type').value;
                    const select = document.getElementById('genre');
                    select.innerHTML = '<option value="">Select style...</option>';
                    genres[type]?.forEach(g => {
                        select.innerHTML += '<option value="' + g.toLowerCase() + '">' + g + '</option>';
                    });
                }
                updateGenres();
                
                async function checkStatus() {
                    const res = await fetch('/debug');
                    const data = await res.json();
                    document.getElementById('status-result').innerHTML = 
                        '<pre style="margin-top:10px; background:rgba(0,0,0,0.3); padding:10px; border-radius:5px;">' + 
                        JSON.stringify(data, null, 2) + '</pre>';
                }
                
                async function generate() {
                    const btn = document.querySelector('button[onclick="generate()"]');
                    btn.disabled = true;
                    btn.textContent = 'Generating...';
                    
                    document.getElementById('result').innerHTML = '<div style="color:#00d4ff">⏳ Generating...</div>';
                    
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
                        
                        if (data.success) {
                            document.getElementById('result').innerHTML = 
                                '<div class="success"><strong>✨ Generated Prompt:</strong><br><br>' + 
                                data.result.replace(/\\n/g, '<br>') + 
                                '</div><button onclick="copy()" style="margin-top:10px; width:auto;">📋 Copy</button>';
                            window.lastResult = data.result;
                        } else {
                            document.getElementById('result').innerHTML = 
                                '<div class="error"><strong>❌ Error:</strong> ' + data.error + 
                                '<br><small>' + (data.instructions || '') + '</small></div>';
                        }
                    } catch(e) {
                        document.getElementById('result').innerHTML = '<div class="error">Error: ' + e.message + '</div>';
                    }
                    
                    btn.disabled = false;
                    btn.textContent = '✨ Generate AI Prompt';
                }
                
                async function analyzeImage(e) {
                    const file = e.target.files[0];
                    if (!file) return;
                    
                    document.getElementById('result').innerHTML = '<div style="color:#00d4ff">🔍 Analyzing image...</div>';
                    
                    const reader = new FileReader();
                    reader.onload = async () => {
                        const base64 = reader.result.split(',')[1];
                        try {
                            const res = await fetch('/api/analyze-image', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({ imageBase64: base64 })
                            });
                            const data = await res.json();
                            
                            document.getElementById('result').innerHTML = data.success ?
                                '<div class="success"><strong>🎨 Image Analysis:</strong><br><br>' + data.description + '</div>' :
                                '<div class="error">❌ ' + data.error + '</div>';
                        } catch(e) {
                            document.getElementById('result').innerHTML = '<div class="error">Error: ' + e.message + '</div>';
                        }
                    };
                    reader.readAsDataURL(file);
                }
                
                function copy() {
                    navigator.clipboard.writeText(window.lastResult);
                    alert('Copied!');
                }
            </script>
        </body>
        </html>
    `);
});

function getSystemPrompt(type, genre) {
    const prompts = {
        music: `You are a professional music producer. Create a detailed prompt for ${genre} music including: BPM, key signature, instruments, mood, and production techniques.`,
        image: `You are an AI art expert. Create a detailed Midjourney/Stable Diffusion prompt for ${genre} style including: subject, lighting, camera angle, and quality modifiers.`,
        character: `You are a character designer. Create a detailed ${genre} character description including: appearance, clothing, personality traits, and backstory.`,
        video: `You are a filmmaker. Create a video concept for ${genre} style including: shot list, lighting, camera movements, and editing style.`,
        esl: `You are an ESL educator. Create learning materials for ${genre} level including: vocabulary list, example sentences, and practice exercises.`,
        default: `You are a creative assistant. Create a detailed prompt based on the request.`
    };
    return prompts[type] || prompts.default;
}

// Error handling
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
