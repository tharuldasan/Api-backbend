import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "15mb" }));

// Helper: Convert array buffer to Base64
const toBase64 = (buffer) => `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;

// 1. Text-To-Image (Pollinations.ai)
app.post("/api/generate", async (req, res) => {
  const { prompt, width = 1024, height = 1024 } = req.body;
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    res.json({ image: toBase64(arrayBuffer) });
  } catch (err) {
    res.status(500).json({ error: "Generation failed" });
  }
});

// 2. Inpaint / Add / Edit Objects (Pollinations.ai POST)
app.post("/api/edit", async (req, res) => {
  const { prompt, base64Image } = req.body;
  try {
    const response = await fetch("https://image.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        init_image: base64Image,
        model: "flux",
        nologo: true,
      }),
    });
    const arrayBuffer = await response.arrayBuffer();
    res.json({ image: toBase64(arrayBuffer) });
  } catch (err) {
    res.status(500).json({ error: "Edit failed" });
  }
});

// 3. Background / Object Removal (Free Hugging Face Serverless)
app.post("/api/remove-bg", async (req, res) => {
  const { base64Image } = req.body;
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/briaai/RMBG-1.4",
      { method: "POST", body: JSON.stringify({ inputs: base64Image }) }
    );
    const arrayBuffer = await response.arrayBuffer();
    res.json({ image: toBase64(arrayBuffer) });
  } catch (err) {
    res.status(500).json({ error: "Background removal failed" });
  }
});

// 4. Super-Resolution Upscaling (Free ESRGAN)
app.post("/api/upscale", async (req, res) => {
  const { base64Image } = req.body;
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/xinntao/ESRGAN",
      { method: "POST", body: JSON.stringify({ inputs: base64Image }) }
    );
    const arrayBuffer = await response.arrayBuffer();
    res.json({ image: toBase64(arrayBuffer) });
  } catch (err) {
    res.status(500).json({ error: "Upscale failed" });
  }
});

export default app;
