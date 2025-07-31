const express = require("express");
const fetch = require("node-fetch"); // NOT axios, fetch handles binary better
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const HF_API_KEY = process.env.HF_API_KEY;

app.use(cors());
app.use(express.json());

app.post("/generate-image", async (req, res) => {
  const { prompt, model, width, height } = req.body;

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: width || 512,
          height: height || 512,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error || "Unknown error" });
    }

    const imageBuffer = await response.buffer(); // important: get raw image
    res.set("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image generation failed" });
  }
});

// Optional: homepage
app.get("/", (req, res) => {
  res.send("✅ AI Backend Server is running!");
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
