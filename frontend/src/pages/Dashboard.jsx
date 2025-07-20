import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [togetherResponse, setTogetherResponse] = useState("");
  const [llamaResponse, setLlamaResponse] = useState("");
  const [rankedBetter, setRankedBetter] = useState("");
  const [rankedReason, setRankedReason] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return alert("Please select a file.");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // ✅ explicitly included for cookies on Render
      });
      setQuestion(res.data.content);
      handleAskAI(res.data.content);
    } catch (err) {
      console.error("Upload error:", err);
      alert("File upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = async (prompt) => {
    if (!prompt) return;
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/ask",
        { question: prompt },
        { withCredentials: true } // ✅ cookies/session support
      );
      setTogetherResponse(res.data.together);
      setLlamaResponse(res.data.llama);
      setRankedBetter(res.data.ranking?.better || "Unknown");
      setRankedReason(res.data.ranking?.reason || "No reason provided.");
    } catch (err) {
      console.error("AI error:", err);
      setTogetherResponse("Error from Together.ai");
      setLlamaResponse("Error from LLaMA");
      setRankedBetter("Error");
      setRankedReason("Failed to determine which answer is better.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-white p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl p-10">
        <h1 className="text-4xl font-bold text-teal-600 text-center mb-8">Synexis AI Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="file"
            accept=".txt,.pdf,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            className="border px-4 py-2 rounded col-span-1"
          />
          <button
            onClick={handleUpload}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition col-span-1"
          >
            Upload File
          </button>
          <button
            onClick={() => handleAskAI(question)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition col-span-1"
          >
            Ask Question
          </button>
        </div>

        <textarea
          rows="4"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question or let AI read your uploaded file..."
          className="w-full border rounded px-4 py-3 mb-6"
        />

        {loading && <p className="text-center text-gray-500 mb-6">⏳ Thinking...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-100 p-5 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-teal-700 mb-2">💬 Together.ai Response</h2>
            <p className="whitespace-pre-wrap text-sm">{togetherResponse}</p>
          </div>
          <div className="bg-gray-100 p-5 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-purple-700 mb-2">🦙 LLaMA Response</h2>
            <p className="whitespace-pre-wrap text-sm">{llamaResponse}</p>
          </div>
        </div>

        {(rankedBetter || rankedReason) && (
          <div className="bg-yellow-50 border border-yellow-300 p-5 rounded-lg shadow mb-4">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">🔍 AI Ranking Result</h3>
            <p>
              <strong>🟢 Better Answer:</strong>{" "}
              {rankedBetter === "A" ? "Together.ai" : rankedBetter === "B" ? "LLaMA" : rankedBetter}
            </p>
            <p><strong>💡 Reason:</strong> {rankedReason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
