const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Allow all origins
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: 'AI Prompt Lab Server Running' });
});

// GEMINI API
app.post('/api/gemini', async (req, res) => {
    try {
        const { prompt, type } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [
                        { text: `You are an AI prompt expert for ${type}.` },
                        { text: prompt }
                    ]
                }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 1500 }
            }
        );

        res.json({ success: true, result: response.data.candidates[0].content.parts[0].text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
