const express = require("express");
const http = require("http");
const path = require("path");
const { exec } = require("child_process");
const Groq = require("groq-sdk");

// Ensure the GROQ_API_KEY is properly set in the environment
exec("export GROQ_API_KEY=$GROQ_API_KEY && echo $GROQ_API_KEY", { env: { ...process.env } }, 
(error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  console.log(`GROQ_API_KEY Output: ${stdout}`);
});

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
  console.log("Server is successfully running with no errors!");
});
