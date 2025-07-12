# Synexis AI Tutor 🤖📚

A full-stack intelligent tutoring system that allows users to:
- 📄 Upload `.txt`, `.pdf`, or `.docx` files
- 🤖 Ask questions manually
- 🔍 Get AI-generated answers from **Together.ai** and **LLaMA 3 (via OpenRouter)**
- 🔐 Login & Signup securely
- 💡 Elegant and modern UI with Tailwind CSS

---

## 🧠 Features

- ✅ Full user authentication (login/register)
- ✅ File upload with content parsing (PDF, DOCX, TXT)
- ✅ Dual AI response: Together.ai & LLaMA
- ✅ Live chat interface with dynamic responses
- ✅ Clean responsive UI

---

## 🚀 Tech Stack

| Frontend          | Backend              | AI Models            |
|------------------|----------------------|----------------------|
| React.js          | Express.js + Node.js | Together.ai (Mixtral)|
| Tailwind CSS      | bcrypt, session auth | OpenRouter (LLaMA 3) |
| Axios             | Multer, pdf-parse    |                      |

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/synexis-ai-tutor.git
cd synexis-ai-tutor
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

```bash
cd ../backend
npm install
```

### 4. Create `.env` file in `backend/`

```env
SESSION_SECRET=your_session_secret
TOGETHER_API_KEY=your_together_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

---

## 🧪 Run the Project

### Start the backend
```bash
cd backend
node server.js
```

### Start the frontend
```bash
cd ../frontend
npm start
```

---

## 📁 Project Structure

```
synexis-ai-tutor/
│
├── frontend/               # React app
│   ├── pages/              # AuthPage, Dashboard
│   ├── components/         # ProtectedRoute etc.
│   ├── App.jsx             # Main Router
│   └── ...
│
├── backend/                # Express server
│   ├── server.js           # Main API logic
│   └── .env                # API keys and secrets
│
└── README.md
```

---

## 🔐 API Keys

You need valid API keys for:

- [Together.ai](https://platform.together.xyz)
- [OpenRouter (LLaMA)](https://openrouter.ai)

Put them in `backend/.env`.

---

## 🧠 Models Used

- **Together.ai**: `mistralai/Mixtral-8x7B-Instruct-v0.1`
- **OpenRouter**: `meta-llama/llama-3-70b-instruct`

---

## 📸 Preview

https://imgbox.com/r9752Wl8
https://imgbox.com/7H1IdGNZ
https://imgbox.com/fOEvkfBL

---

## 📤 Deploy Instructions (Coming Soon...)

---

