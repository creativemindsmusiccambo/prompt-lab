// server.js - Express backend for OpenAI API
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Generate prompt endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { type, params } = req.body;

        // Build system prompt based on type
        const systemPrompts = {
            music: `You are an expert music producer and prompt engineer. Create detailed prompts for AI music generation tools like Suno, Udio, or Stable Audio.`,
            lyrics: `You are a professional songwriter. Create compelling lyrics prompts with structure, rhyme schemes, and emotional depth.`,
            image: `You are an expert in AI image generation. Create detailed prompts for Midjourney, DALL-E, or Stable Diffusion.`,
            education: `You are an experienced educator. Create clear, engaging educational content.`,
            esl: `You are an ESL (English as a Second Language) expert. Create effective language learning materials.`,
            keywords: `You are a prompt engineering specialist. Create optimized prompts for any AI task.`
        };

        const userPrompt = buildUserPrompt(type, params);

        const completion = await openai.chat.completions.create({
            model: "gpt-4", // or "gpt-3.5-turbo" for cheaper option
            messages: [
                { role: "system", content: systemPrompts[type] || systemPrompts.keywords },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 1000
        });

        res.json({
            success: true,
            prompt: completion.choices[0].message.content
        });

    } catch (error) {
        console.error('OpenAI Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

function buildUserPrompt(type, params) {
    switch(type) {
        case 'music':
            return `Create a music generation prompt for:
Genre: ${params.genre}
BPM: ${params.bpm}
Mood: ${params.mood}
Keywords: ${params.keywords}

Include: instrumentation details, production style, atmosphere, and structure.`;

        case 'lyrics':
            return `Write lyrics for a ${params.genre} song about "${params.topic}".
Mood: ${params.mood}
Structure: ${params.structure}
Keywords to include: ${params.keywords}

Provide verse-chorus structure with rhyme scheme.`;

        case 'image':
            return `Create an image generation prompt:
Subject: ${params.subject}
Style: ${params.style}
Lighting: ${params.lighting}
Aspect Ratio: ${params.ratio}

Include: detailed description, artistic style, camera settings, mood.`;

        case 'esl':
            return `Create ESL learning material:
Level: ${params.proficiency} (CEFR)
Type: ${params.contentType}
Topic: ${params.topic}
Native Language: ${params.nativeLang}
Focus: ${params.focus}
Context: ${params.context}

Include appropriate exercises, examples, and cultural notes.`;

        default:
            return `Create an optimized prompt for: ${params.topic}
Style: ${params.style}
Keywords: ${params.keywords}`;
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
