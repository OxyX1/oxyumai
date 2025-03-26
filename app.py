from flask import Flask, request, jsonify, render_template
import requests

app = Flask(__name__)

# Replace with your actual Qroq API key
QROQ_API_KEY = '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'
QROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        headers = {
            'Authorization': f'Bearer {QROQ_API_KEY}',
            'Content-Type': 'application/json',
        }
        response = requests.post(
            QROQ_API_URL,
            headers=headers,
            json={'text': text}
        )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)