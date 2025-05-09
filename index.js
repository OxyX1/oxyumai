// THIS IS NOT A WEBSITE, THIS IS OXYUM SCHOOL CHEAT OFFICIAL BACKEND AND OPEN SOURCE.

const express = require("express");
const multer = require("multer");
const tesseract = require("tesseract.js");
const math = require("mathjs");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8080;

// Set up multer for file upload
const upload = multer({ dest: "uploads/" });

app.post("/solve", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).send("No image uploaded.");

  try {
    const { path } = req.file;

    // OCR: Extract text from image
    const { data: { text } } = await tesseract.recognize(path, "eng");

    console.log("OCR Result:", text);

    // Try to extract and clean math expression
    const match = text.match(/what\s+is\s+([0-9x+\-*/().\s]+)\??/i);
    if (!match) return res.status(400).send("No valid math question found.");

    const expression = match[1].replace(/x/g, "*").trim();
    const answer = math.evaluate(expression).toString();

    console.log(`Question: ${expression} | Answer: ${answer}`);

    res.send({ expression, answer });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing image.");
  } finally {
    fs.unlinkSync(req.file.path); // delete the temp image
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
