require('dotenv').config();
const express = require("express");
const port = process.env.PORT || 5010;

const app = express();

app.get("/", (req, res) => {
    res.send("hello")
});

app.listen(port, () => {
    console.log(`Express server is running on localhost:${port}`);
});
