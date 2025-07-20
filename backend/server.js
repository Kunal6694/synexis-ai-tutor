const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const session = require("express-session");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

let fetch = global.fetch;
if (!fetch) fetch = require("node-fetch");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Import User model
const User = require("./models/User");

// Middleware
app.use(cors({
  origin: "https://synexis-frontend.onrender.com", // ✅ Your deployed frontend URL
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,       // ✅ Required for HTTPS
    sameSite: "none",   // ✅ Allows cross-origin cookies
  },
}));

const upload = multer({ dest: "uploads/" });

// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required." });

  const exists = await User.findOne({ email });
  if (exists)
    return res.status(400).json({ message: "User already exists." });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed });
  await user.save();

  res.status(201).json({ message: "Registered successfully." });
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials." });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials." });

  req.session.user = { name: user.name, email: user.email };
  res.json({ message: "Login successful." });
});

// File Upload
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });

  const filePath = path.join(__dirname, req.file.path);
  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    let content = "";

    if (ext === ".txt") {
      content = fs.readFileSync(filePath, "utf-8");
    } else if (ext === ".pdf") {
      const data = await pdfParse(fs.readFileSync(filePath));
      content = data.text;
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      content = result.value;
    } else {
      return res.status(400).json({ message: "Unsupported file format." });
    }

    fs.unlinkSync(filePath); // delete temp file
    res.json({ message: "File uploaded", content });
  } catch (err) {
    console.error("File parsing error:", err);
    res.status(500).json({ message: "Failed to read file." });
  }
});

// AI Answer + Ranking
app.post("/api/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ message: "Question required." });

  const togetherKey = process.env.TOGETHER_API_KEY;
  const llamaKey = process.env.OPENROUTER_API_KEY;

  try {
    const [togetherRes, llamaRes] = await Promise.all([
      fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${togetherKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          messages: [{ role: "user", content: question }],
          max_tokens: 512,
        }),
      }),
      fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${llamaKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-70b-instruct",
          messages: [{ role: "user", content: question }],
          max_tokens: 512,
        }),
      }),
    ]);

    const togetherData = await togetherRes.json();
    const llamaData = await llamaRes.json();

    const togetherOutput = togetherData?.choices?.[0]?.message?.content || "Error from Together.ai";
    const llamaOutput = llamaData?.choices?.[0]?.message?.content || "Error from LLaMA";

    const rankingPrompt = `
You are an expert evaluator. Given the user's question and two AI-generated answers, evaluate which answer is better and explain why.

Question: "${question}"

Answer A (from Together AI):
${togetherOutput}

Answer B (from LLaMA 3):
${llamaOutput}

Please answer in this format:

{
  "better": "A" or "B",
  "reason": "Your reasoning here"
}
`;

    const rankingRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${llamaKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-70b-instruct",
        messages: [{ role: "user", content: rankingPrompt }],
        max_tokens: 256,
      }),
    });

    const rankingData = await rankingRes.json();
    const rankingText = rankingData?.choices?.[0]?.message?.content || "Could not rank the answers.";

    let parsedRanking;
    try {
      parsedRanking = JSON.parse(rankingText);
    } catch {
      parsedRanking = { better: "Unknown", reason: rankingText };
    }

    res.json({
      together: togetherOutput,
      llama: llamaOutput,
      ranking: parsedRanking,
    });
  } catch (err) {
    console.error("AI API error:", err);
    res.status(500).json({ message: "AI request failed." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
