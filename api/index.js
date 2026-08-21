import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// Allow all origins (GitHub Pages) to send requests
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "15mb" }));

// Handle preflight OPTIONS requests explicitly
app.options("*", cors());

// ... rest of your endpoints (/api/generate, /api/edit, etc.)
