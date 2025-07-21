import React, { useState, useRef, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [togetherResponse, setTogetherResponse] = useState("");
  const [llamaResponse, setLlamaResponse] = useState("");
  const [rankedBetter, setRankedBetter] = useState("");
  const [rankedReason, setRankedReason] = useState("");
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingAsk, setLoadingAsk] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [question]);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoadingUpload(true);
      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setQuestion(res.data.content);
      await handleAskAI(res.data.content);
      alert("File uploaded and content extracted!");
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.response?.data?.message || "File upload failed.");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleAskAI = async (prompt) => {
    if (!prompt) {
      alert("Please enter a question or upload a file first.");
      return;
    }
    try {
      setLoadingAsk(true);
      setTogetherResponse("");
      setLlamaResponse("");
      setRankedBetter("");
      setRankedReason("");

      const res = await axios.post(
        "/api/ask",
        { question: prompt },
        { withCredentials: true }
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
      alert(err.response?.data?.message || "Failed to get AI response.");
    } finally {
      setLoadingAsk(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const acceptedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (acceptedTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
      } else {
        alert("Unsupported file type. Please upload .txt, .pdf, or .docx files.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy text. Please try again or copy manually.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-white p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl p-10">
        <h1 className="text-4xl font-bold text-teal-600 text-center mb-8">Synexis AI Dashboard</h1>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed ${
            dragOver ? "border-teal-500 bg-teal-50" : "border-gray-300 bg-gray-50"
          } rounded-lg p-6 text-center mb-6 transition-all duration-200 ease-in-out`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".txt,.pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-gray-700 font-medium">{file.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleClearFile(); }}
                className="text-red-500 hover:text-red-700 transition"
                title="Remove file"
              >
                &times;
              </button>
            </div>
          ) : (
            <p className="text-gray-500">
              Drag & drop your file here, or{" "}
              <span className="text-teal-500 font-semibold cursor-pointer">click to browse</span>
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">Accepted: .txt, .pdf, .docx</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleUpload}
            className={`bg-teal-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-teal-600 transition 
              ${loadingUpload ? "opacity-70 cursor-not-allowed" : ""}`}
            disabled={loadingUpload || !file}
          >
            {loadingUpload ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload File"
            )}
          </button>
          <button
            onClick={() => handleAskAI(question)}
            className={`bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition 
              ${loadingAsk ? "opacity-70 cursor-not-allowed" : ""}`}
            disabled={loadingAsk || !question}
          >
            {loadingAsk ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Asking AI...
              </span>
            ) : (
              "Ask Question"
            )}
          </button>
        </div>

        {/* Textarea with auto-resizing */}
        <textarea
          ref={textareaRef}
          rows="1"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question or let AI read your uploaded file..."
          className="w-full border rounded px-4 py-3 mb-6 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Together.ai Response Card */}
          <div
            className={`p-5 rounded-lg shadow-md transition-all duration-300 ease-in-out 
              ${rankedBetter === "A" ? "bg-teal-50 border-2 border-teal-500 shadow-xl scale-100" : "bg-teal-50/50 hover:shadow-lg"}`}
          > {/* FIX: Closing backtick was missing before this closing `}` */}
            <h2 className="text-xl font-semibold text-teal-700 mb-2 flex items-center justify-between">
              <span className="flex items-center"><span className="mr-2 text-2xl">💬</span> Together.ai Response</span>
              {togetherResponse && (
                <button
                  onClick={() => copyToClipboard(togetherResponse)}
                  className="text-gray-500 hover:text-teal-700 text-sm flex items-center"
                  title="Copy response"
                >
                  📋 Copy
                </button>
              )}
            </h2>
            <p className="whitespace-pre-wrap text-sm text-gray-800">
              {togetherResponse || "Response will appear here..."}
            </p>
          </div>

          {/* LLaMA Response Card */}
          <div
            className={`p-5 rounded-lg shadow-md transition-all duration-300 ease-in-out 
              ${rankedBetter === "B" ? "bg-purple-50 border-2 border-purple-500 shadow-xl scale-100" : "bg-purple-50/50 hover:shadow-lg"}`}
          > {/* FIX: Closing backtick was missing before this closing `}` */}
            <h2 className="text-xl font-semibold text-purple-700 mb-2 flex items-center justify-between">
              <span className="flex items-center"><span className="mr-2 text-2xl">🦙</span> LLaMA Response</span>
              {llamaResponse && (
                <button
                  onClick={() => copyToClipboard(llamaResponse)}
                  className="text-gray-500 hover:text-purple-700 text-sm flex items-center"
                  title="Copy response"
                >
                  📋 Copy
                </button>
              )}
            </h2>
            <p className="whitespace-pre-wrap text-sm text-gray-800">
              {llamaResponse || "Response will appear here..."}
            </p>
          </div>
        </div>

        {/* AI Ranking Result */}
        {(rankedBetter || rankedReason) && (
          <div className="bg-gradient-to-r from-emerald-100 to-lime-100 border border-green-300 p-6 rounded-lg shadow-xl mb-4">
            <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center justify-center">
              <span className="mr-3 text-3xl">🏆</span> AI Ranking Result <span className="ml-3 text-3xl">🏆</span>
            </h3>
            <div className="space-y-2 text-gray-700">
                <p className="flex items-center">
                    <strong className="mr-2 text-green-600 text-lg">✨ Better Answer:</strong>{" "}
                    {rankedBetter === "A" ? (
                        <span className="font-semibold text-teal-600">Together.ai</span>
                    ) : rankedBetter === "B" ? (
                        <span className="font-semibold text-purple-600">LLaMA</span>
                    ) : (
                        <span className="italic">{rankedBetter}</span>
                    )}
                </p>
                <p className="flex items-start">
                    <strong className="mr-2 text-green-600 text-lg">💡 Reason:</strong>{" "}
                    <span className="flex-1">{rankedReason}</span>
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;