const express = require("express");
const http = require("http");
const path = require("path");


const port = process.env.PORT || 8080;
const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});