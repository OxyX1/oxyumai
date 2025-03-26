document.getElementById('ai-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const inputText = document.getElementById('input-text').value;
    const resultDiv = document.getElementById('result');

    try {
        const response = await fetch('/process-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: inputText })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Network response was not ok: ${errorData.error}`);
        }

        const data = await response.json();
        resultDiv.textContent = `Result: ${data.result}`;
    } catch (error) {
        resultDiv.textContent = `Error: ${error.message}`;
    }
});