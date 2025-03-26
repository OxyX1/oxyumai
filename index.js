const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to process data with Groq AI
app.post('/process-data', async (req, res) => {
    const data = req.body;

    try {
        // Replace with your Groq API key and endpoint
        const GROQ_API_KEY = 'your_groq_api_key';
        const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

        const response = await axios.post(GROQ_API_ENDPOINT, data, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to process data with Groq AI' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});