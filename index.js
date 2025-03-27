require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const http = require("http");
const path = require("path");
const Groq = require("groq-sdk");

// Ensure the GROQ_API_KEY is properly set
if (!process.env.GROQ_API_KEY) {
  console.error("Error: GROQ_API_KEY is not set. Please define it in your environment or .env file.");
  process.exit(1);
}

// Initialize Groq SDK with API Key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Explain the importance of fast language models",
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    console.log(completion.choices[0]?.message?.content || "");
  } catch (err) {
    console.error("Error in Groq API call:", err);
  }
}

main();

const port = process.env.PORT || 8080;
const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/chat-bot", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chatbot", "index.html"));
});

app.get("/image-generation", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "imageline", "index.html"));
});

app.get("/playground", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "playground", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is successfully running on port ${port}!`);
});
