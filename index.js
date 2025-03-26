const express = require("express");
const http = require("http");
const path = require("path");


const port = process.env.PORT || 8080;
const app = express(); 

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/chat-bot', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chatbot', 'index.html'));
});

app.get('/image-generation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'imageline', 'index.html'));

});

app.get('/playground', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'playground', 'index.html'));
});

app.listen(port, () => {
    console.log("server is successfully running with no errors!");
});