// ai-service.js - Frontend AI integration module

// ============================================
// OPTION 1: Call Your Own Backend (RECOMMENDED)
// ============================================
const API_BASE_URL = 'http://localhost:3000/api'; // Your backend URL

async function generateWithBackend(type, params) {
    try {
        showLoading(true);

        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, params })
        });

        const data = await response.json();

        if (data.success) {
            return data.prompt;
        } else {
            throw new Error(data.error);
        }

    } catch (error) {
        console.error('Generation failed:', error);
        showNotification('AI generation failed: ' + error.message, true);
        return null;
    } finally {
        showLoading(false);
    }
}

// ============================================
// OPTION 2: Direct OpenAI Call (Browser - Less Secure)
// ⚠️ Only for demos - exposes API key!
// ============================================
async function generateWithOpenAI(type, params) {
    const OPENAI_API_KEY = 'sk-your-key-here'; // ⚠️ NEVER do this in production!

    const systemPrompts = {
        music: `You are an expert music producer. Create detailed prompts for AI music generation.`,
        lyrics: `You are a professional songwriter. Create compelling lyrics.`,
        image: `You are an AI image generation expert. Create detailed prompts for Midjourney/DALL-E.`,
        education: `You are an experienced educator. Create engaging educational content.`,
        esl: `You are an ESL expert. Create effective language learning materials.`,
        keywords: `You are a prompt engineering specialist.`
    };

    try {
        showLoading(true);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompts[type] },
                    { role: 'user', content: buildPrompt(type, params) }
                ],
                temperature: 0.8,
                max_tokens: 1000
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error('OpenAI Error:', error);
        showNotification('AI generation failed', true);
        return null;
    } finally {
        showLoading(false);
    }
}

// ============================================
// OPTION 3: Google Gemini (FREE TIER!)
// https://ai.google.dev/ - Get free API key
// ============================================
async function generateWithGemini(type, params) {
    const GEMINI_API_KEY = 'your-gemini-api-key'; // Get from makersuite.google.com

    const prompt = buildPrompt(type, params);

    try {
        showLoading(true);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 1000
                    }
                })
            }
        );

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error('Gemini Error:', error);
        showNotification('AI generation failed', true);
        return null;
    } finally {
        showLoading(false);
    }
}

// ============================================
// OPTION 4: Hugging Face (FREE Inference API)
// https://huggingface.co/settings/tokens
// ============================================
async function generateWithHuggingFace(type, params) {
    const HF_API_KEY = 'hf_your_token_here';
    const MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

    const prompt = `<s>[INST] ${buildPrompt(type, params)} [/INST]`;

    try {
        showLoading(true);

        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 1000,
                        temperature: 0.8,
                        return_full_text: false
                    }
                })
            }
        );

        const data = await response.json();
        return data[0].generated_text;

    } catch (error) {
        console.error('HF Error:', error);
        showNotification('AI generation failed', true);
        return null;
    } finally {
        showLoading(false);
    }
}

// ============================================
// OPTION 5: Ollama (LOCAL - 100% FREE & PRIVATE)
// Run AI models on your own computer
// https://ollama.com
// ============================================
async function generateWithOllama(type, params) {
    // Ollama runs locally on port 11434
    const OLLAMA_URL = 'http://localhost:11434/api/generate';

    const prompt = buildPrompt(type, params);

    try {
        showLoading(true);

        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'mistral', // or 'llama2', 'codellama', etc.
                prompt: prompt,
                stream: false
            })
        });

        const data = await response.json();
        return data.response;

    } catch (error) {
        console.error('Ollama Error:', error);
        showNotification('Make sure Ollama is running locally', true);
        return null;
    } finally {
        showLoading(false);
    }
}

// Helper function to build prompts
function buildPrompt(type, params) {
    switch(type) {
        case 'music':
            return `Create a detailed music generation prompt for:
Genre: ${params.genre}
BPM: ${params.bpm}
Mood: ${params.mood}
Keywords: ${params.keywords || 'none'}

Include specific instrumentation, production techniques, atmosphere, and structure. Format as a professional prompt for AI music tools like Suno or Udio.`;

        case 'lyrics':
            return `Write original lyrics for a ${params.genre} song about "${params.topic}".
Mood: ${params.mood}
Structure: ${params.structure}
Keywords to weave in: ${params.keywords || 'none'}

Provide complete verse-chorus structure with [Verse], [Chorus], [Bridge] labels. Include rhyme scheme and emotional arc.`;

        case 'image':
            return `Create a detailed image generation prompt:
Subject: ${params.subject}
Style: ${params.style}
Lighting: ${params.lighting}
Aspect Ratio: ${params.ratio}

Include: detailed visual description, artistic style references, camera/lens info, mood, color palette. Format for Midjourney or DALL-E.`;

        case 'esl':
            return `Create ESL (English as Second Language) learning material:
Proficiency Level: ${params.proficiency} (CEFR)
Content Type: ${params.contentType}
Topic: ${params.topic}
Student's Native Language: ${params.nativeLang}
Focus Area: ${params.focus}
Specific Context: ${params.context || 'General'}

Include: appropriate vocabulary level, clear instructions, examples, practice exercises, and cultural notes.`;

        case 'education':
            return `Create educational content:
Type: ${params.type}
Topic: ${params.topic}
Level: ${params.level}
Tone: ${params.tone}

Make it engaging, accurate, and age-appropriate.`;

        default:
            return `Create an optimized AI prompt for: ${params.topic}
Style: ${params.style}
Keywords: ${params.keywords}
Length: ${params.length}`;
    }
}

// Loading indicator
function showLoading(show) {
    const btn = document.querySelector('.tab-content.active .generate-btn');
    if (btn) {
        btn.disabled = show;
        btn.innerHTML = show ? '<span class="loading"></span> Generating...' : '⚡ Generate';
    }
}

// ============================================
// MAIN GENERATION FUNCTION - Choose your provider
// ============================================
async function generateWithAI(type) {
    // Collect parameters based on type
    const params = collectParams(type);

    // Choose your AI provider (uncomment one):
    // return await generateWithBackend(type, params);      // Your backend
    // return await generateWithOpenAI(type, params);       // OpenAI direct
    // return await generateWithGemini(type, params);       // Google Gemini (FREE)
    // return await generateWithHuggingFace(type, params);  // Hugging Face (FREE)
    return await generateWithOllama(type, params);          // Local Ollama (FREE)
}

function collectParams(type) {
    switch(type) {
        case 'music':
            return {
                genre: currentMusicGenre,
                bpm: document.getElementById('music-bpm').value,
                mood: document.getElementById('music-mood').value,
                keywords: document.getElementById('music-keywords').value
            };
        case 'lyrics':
            return {
                genre: currentLyricsGenre,
                topic: document.getElementById('lyrics-topic').value,
                mood: document.getElementById('lyrics-mood').value,
                structure: document.getElementById('lyrics-structure').value,
                keywords: document.getElementById('lyrics-keywords').value
            };
        case 'image':
            return {
                style: currentImageStyle,
                subject: document.getElementById('image-subject').value,
                lighting: document.getElementById('image-lighting').value,
                ratio: document.getElementById('image-ratio').value
            };
        case 'esl':
            return {
                proficiency: document.getElementById('esl-proficiency').value,
                contentType: document.getElementById('esl-content-type').value,
                nativeLang: document.getElementById('esl-native-lang').value,
                focus: document.getElementById('esl-focus').value,
                topic: document.getElementById('edu-topic').value,
                context: document.getElementById('esl-context').value
            };
        case 'education':
            return {
                type: currentEduType,
                topic: document.getElementById('edu-topic').value,
                level: document.getElementById('edu-level').value,
                tone: document.getElementById('edu-tone').value
            };
        case 'keywords':
            return {
                topic: document.getElementById('kw-topic').value,
                keywords: document.getElementById('kw-keywords').value,
                style: document.getElementById('kw-style').value,
                length: document.getElementById('kw-length').value
            };
        default:
            return {};
    }
}

// Export for use in main app
window.generateWithAI = generateWithAI;
