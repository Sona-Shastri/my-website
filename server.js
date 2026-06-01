// This is your web server — the "restaurant" that serves your website.
const express = require("express");
const path = require("path");

const app = express();

// Hand out everything in the "public" folder (your HTML + CSS).
app.use(express.static(path.join(__dirname, "public")));

// Railway tells us which "door" (port) to use; locally we use 3000.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Your website is running! Open http://localhost:${PORT}`);
});
