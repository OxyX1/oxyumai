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

        console.log('Sending request to Groq AI:', GROQ_API_ENDPOINT, data);

        const response = await axios.post(GROQ_API_ENDPOINT, data, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response from Groq AI:', response.data);

        res.json(response.data);
    } catch (error) {
        console.error('Error processing data with Groq AI:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to process data with Groq AI', details: error.response ? error.response.data : error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});