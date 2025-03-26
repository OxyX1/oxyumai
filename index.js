const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to process data with Groq AI
app.post('/process-data', async (req, res) => {
    const data = req.body;

    try {
        // Use environment variables for API key and endpoint
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        const GROQ_API_ENDPOINT = process.env.GROQ_API_ENDPOINT;

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