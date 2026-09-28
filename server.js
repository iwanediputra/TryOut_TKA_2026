import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

app.use(express.json());

// Initialize Google Gemini SDK if API key is present
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Proxy API endpoint for AI features (Hint, Tutor Chat, Result Analysis)
app.post('/api/gemini', async (req, res) => {
    try {
        const { prompt, systemInstruction } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        if (!ai) {
            return res.status(503).json({
                error: 'Gemini API key not configured',
                fallback: true
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: systemInstruction ? { systemInstruction } : undefined
        });

        const reply = response.text || '';
        return res.json({ text: reply });
    } catch (error) {
        console.error('Error generating AI content:', error);
        return res.status(500).json({
            error: error.message || 'Failed to generate content',
            fallback: true
        });
    }
});

// Serve static assets from project directory
app.use(express.static(__dirname));

// Fallback to index.html for SPA/HTML routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, host, () => {
    console.log(`Try Out TKA 2026 app server listening on http://${host}:${port}`);
});
