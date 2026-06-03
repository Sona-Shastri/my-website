// Nano Banana image generator (Google Gemini 2.5 Flash Image)
// Usage:  node generate-image.js "a description of the picture you want"
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("PASTE")) {
    console.error("\n❌ No API key found. Open the .env file and paste your Gemini API key.\n");
    process.exit(1);
  }

  // What to draw — taken from what you type after the command, or a default.
  const prompt =
    process.argv.slice(2).join(" ") ||
    "A cute pastel lavender watercolor heart with dainty floral lace, soft and delicate, on a plain white background";

  console.log("\n🍌 Asking Nano Banana to draw:\n   " + prompt + "\n");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  let saved = false;
  for (const part of parts) {
    if (part.inlineData) {
      const buffer = Buffer.from(part.inlineData.data, "base64");
      const outPath = path.join(__dirname, "public", "generated.png");
      fs.writeFileSync(outPath, buffer);
      console.log("✅ Saved your image to public/generated.png\n");
      saved = true;
    }
  }
  if (!saved) console.error("⚠️ No image came back — try a different description.\n");
}

main().catch((err) => {
  console.error("Something went wrong:", err.message);
  process.exit(1);
});
