from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

API_KEY = "AIzaSyB_7iJXnH2WuAbJ7qIkBa0cK2r37xy4CFE"
print(API_KEY)


genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("models/gemini-2.5-pro-exp-03-25")

@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'Google Gemini Chatbot Backend is running'})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')

    try:
        response = model.generate_content(user_message)
        response_text = response.text.strip()
    except Exception as e:
        response_text = f"Error calling Google Gemini model: {str(e)}"

    return jsonify({'response': response_text})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
