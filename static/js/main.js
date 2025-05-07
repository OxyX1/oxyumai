document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const temperatureSlider = document.getElementById('temperatureSlider');
    const temperatureValueDisplay = document.getElementById('temperatureValue');
    const promptInput = document.getElementById('promptInput');
    const generateButton = document.getElementById('generateButton');
    const outputTextDiv = document.getElementById('outputText');
    const loadingIndicator = document.getElementById('loadingIndicator');

    temperatureSlider.addEventListener('input', (e) => {
        temperatureValueDisplay.textContent = parseFloat(e.target.value).toFixed(1);
    });

    generateButton.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const prompt = promptInput.value.trim();
        const temperature = parseFloat(temperatureSlider.value);

        if (!apiKey) {
            outputTextDiv.textContent = 'Error: OpenAI API Key is missing.';
            outputTextDiv.style.color = 'var(--error-color)';
            return;
        }
        if (!prompt) {
            outputTextDiv.textContent = 'Error: Prompt is empty.';
            outputTextDiv.style.color = 'var(--error-color)';
            return;
        }

        outputTextDiv.textContent = '';
        outputTextDiv.style.color = 'var(--text-color)';
        loadingIndicator.style.display = 'block';
        generateButton.disabled = true;

        // --- OPTION 1: Direct call to OpenAI (API Key exposed in frontend) ---
        const OPENAI_API_URL = 'https://api.openai.com/v1/completions';
        const MODEL_NAME = 'gpt-3.5-turbo-instruct';

        const requestBody = {
            model: MODEL_NAME,
            prompt: prompt,
            temperature: temperature,
            max_tokens: 500,
        };

        try {
            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('OpenAI API Error:', data);
                let errorMessage = `API Error: ${response.status}`;
                if (data && data.error && data.error.message) {
                    errorMessage += ` - ${data.error.message}`;
                }
                if (response.status === 401) errorMessage = "OpenAI API Error: Invalid API Key or authentication issue.";
                if (response.status === 429) errorMessage = "OpenAI API Error: Rate limit exceeded or quota issues. Check OpenAI account.";
                throw new Error(errorMessage);
            }

            if (data.choices && data.choices.length > 0 && data.choices[0].text) {
                outputTextDiv.textContent = data.choices[0].text.trim();
            } else {
                outputTextDiv.textContent = 'No text choice returned from the API.';
                console.log("Unexpected API response:", data);
            }

        } catch (error) {
            console.error('Fetch Error:', error);
            outputTextDiv.textContent = `Error: ${error.message}`;
            outputTextDiv.style.color = 'var(--error-color)';
        } finally {
            loadingIndicator.style.display = 'none';
            generateButton.disabled = false;
        }


        // --- OPTION 2: Call your own backend proxy (Safer for API Key) ---
        // To use this, uncomment the /api/generate route in index.js (Node server)
        // and comment out OPTION 1 above.
        try {
            const response = await fetch('/api/generate', { // Calls your Node.js server
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    temperature: temperature,
                    model: 'gpt-3.5-turbo-instruct' // Or let server decide
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Backend API Error:', data);
                let errorMessage = `API Error: ${response.status}`;
                if (data && data.error && data.error.message) { // OpenAI error structure
                    errorMessage += ` (OpenAI: ${data.error.message})`;
                } else if (data && data.error) { // Server's own error
                    errorMessage += ` - ${data.error}`;
                }
                throw new Error(errorMessage);
            }

            if (data.choices && data.choices.length > 0 && data.choices[0].text) {
                outputTextDiv.textContent = data.choices[0].text.trim();
            } else {
                outputTextDiv.textContent = 'No text choice returned from the API via backend.';
                 console.log("Unexpected API response from backend:", data);
            }

        } catch (error) {
            console.error('Error calling backend proxy:', error);
            outputTextDiv.textContent = `Error: ${error.message}`;
            outputTextDiv.style.color = 'var(--error-color)';
        } finally {
            loadingIndicator.style.display = 'none';
            generateButton.disabled = false;
        }
    });
});