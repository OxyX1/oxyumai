import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname is not available in ES modules, so we define it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to serve static files (HTML, CSS, client-side JS)
app.use(express.static(path.join(__dirname, 'static')));

// Basic route for the root path to ensure index.html is served
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// --- IMPORTANT: API Proxy Route (Future Enhancement) ---
// If you want to secure your API key, you would create an endpoint here
// that your frontend calls. This server endpoint would then make the
// actual call to OpenAI, adding the API key securely.
app.use(express.json()); // To parse JSON request bodies

app.post('/api/generate', async (req, res) => {
    const { prompt, temperature, model } = req.body;
    const apiKey = process.env.OPENAI_API_KEY; // Load from environment variable

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured on server.' });
    }
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
        const OPENAI_API_URL = 'https://api.openai.com/v1/completions'; // or chat/completions
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || 'gpt-3.5-turbo-instruct',
                prompt: prompt,
                temperature: temperature || 0.5,
                max_tokens: 500
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('OpenAI API Error (from server):', data);
            return res.status(response.status).json(data);
        }
        res.json(data);

    } catch (error) {
        console.error('Server error calling OpenAI:', error);
        res.status(500).json({ error: 'Failed to fetch from OpenAI API.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});