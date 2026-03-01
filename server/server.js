const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 10000;

// ==========================================
// DEBUG: Check all environment variables
// ==========================================
app.get('/debug', (req, res) => {
    res.json({
        gemini_key_exists: process.env.GEMINI_API_KEY ? true : false,
        gemini_key_value: process.env.GEMINI_API_KEY ? 
            process.env.GEMINI_API_KEY.substring(0, 15) + '...' : 'NOT SET',
        all_env_keys: Object.keys(process.env).filter(k => 
            !k.includes('PATH') && !k.includes('PORT') && !k.includes('HOME')
        ),
        node_env: process.env.NODE_ENV || 'not set'
    });
});

// ==========================================
// WORKING VERSION - Hardcoded for testing
// ==========================================
// Replace 'YOUR_KEY_HERE' with your actual key temporarily
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBOMaXYQy-4BqtZ1QVIjqN4xxzWUNLebvs'; // ← Put new key here

app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, type, genre } = req.body;
        
        console.log('Using key:', GEMINI_API_KEY ? 'YES' : 'NO'); // Debug log
        
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_KEY_HERE') {
            return res.status(500).json({ 
                success: false, 
                error: 'API key not configured',
                debug: 'Key is: ' + (GEMINI_API_KEY ? 'Set but invalid' : 'Empty')
            });
        }

        const systemPrompt = getSystemPrompt(type, genre);
        
        console.log('Sending request to Gemini...'); // Debug log
        
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: `${systemPrompt}\n\nUser: ${prompt}` }]
                }]
            },
            { timeout: 10000 }
        );

        const result = response.data.candidates[0].content.parts[0].text;
        console.log('Success!'); // Debug log
        res.json({ success: true, result });

    } catch (error) {
        console.error('Full error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: error.response?.data 
        });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI Prompt Lab - DEBUG MODE</title>
            <style>
                body { font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; }
                .box { background: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0; }
                button { padding: 15px; font-size: 18px; cursor: pointer; }
                #result { margin-top: 20px; padding: 20px; background: #e0e0e0; border-radius: 5px; }
                .error { color: red; }
                .success { color: green; }
            </style>
        </head>
        <body>
            <h1>🧪 DEBUG MODE</h1>
            
            <div class="box">
                <h3>Step 1: Check Environment Variables</h3>
                <button onclick="checkEnv()">Check /debug Endpoint</button>
                <div id="env-result"></div>
            </div>
            
            <div class="box">
                <h3>Step 2: Test AI Generation</h3>
                <input type="text" id="prompt" value="A cyberpunk city" style="width:100%; padding:10px; margin:10px 0;">
                <button onclick="testAI()">Test AI</button>
                <div id="ai-result"></div>
            </div>

            <script>
                async function checkEnv() {
                    const res = await fetch('/debug');
                    const data = await res.json();
                    document.getElementById('env-result').innerHTML = 
                        '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                }
                
                async function testAI() {
                    const prompt = document.getElementById('prompt').value;
                    document.getElementById('ai-result').innerHTML = 'Loading...';
                    
                    try {
                        const res = await fetch('/api/generate', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({prompt, type: 'image', genre: 'cyberpunk'})
                        });
                        const data = await res.json();
                        document.getElementById('ai-result').innerHTML = 
                            '<pre class="' + (data.success ? 'success' : 'error') + '">' + 
                            JSON.stringify(data, null, 2) + '</pre>';
                    } catch(e) {
                        document.getElementById('ai-result').innerHTML = 
                            '<div class="error">Error: ' + e.message + '</div>';
                    }
                }
            </script>
        </body>
        </html>
    `);
});

function getSystemPrompt(type, genre) {
    return `You are a creative assistant. Create a ${genre} ${type} prompt.`;
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Key configured:`, GEMINI_API_KEY ? 'YES' : 'NO');
});
