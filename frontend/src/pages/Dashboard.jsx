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
      alert("File uploaded and content extracted! Now you can ask a question.");
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

  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background-DEFAULT font-sans text-text-DEFAULT flex flex-col">
      <header className="bg-white shadow-smooth p-4 sm:px-8 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-heading text-primary tracking-wide">
          SynExis AI Tutor
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition shadow-sm hover:shadow-md"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        {/* Your Query Input Section */}
        <section className="bg-background-card p-6 rounded-xl shadow-elevate mb-8 transition-all duration-300 hover:shadow-premium hover:-translate-y-1">
          <h2 className="text-2xl font-heading text-primary mb-6">Your Query</h2>
          
          <div
            className={`border-2 border-dashed ${
              dragOver ? "border-accent bg-accent/10" : "border-gray-300 bg-background-DEFAULT"
            } rounded-lg p-5 text-center mb-6 transition-all duration-200 ease-in-out cursor-pointer hover:border-primary hover:bg-gray-50`}
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
              <div className="flex items-center justify-center space-x-2 text-primary font-medium">
                <span className="text-2xl">📄</span>
                <span>{file.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleClearFile(); }}
                  className="text-text-secondary hover:text-accent transition"
                  title="Remove file"
                >
                  &times;
                </button>
              </div>
            ) : (
              <p className="text-text-secondary">
                Drag & drop your file here, or{" "}
                <span className="text-primary font-semibold">click to browse</span>
              </p>
            )}
            <p className="text-xs text-text-secondary mt-2">Accepted: .txt, .pdf, .docx (Max 10MB)</p>
          </div>

          <textarea
            ref={textareaRef}
            rows="1"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here, or content will be extracted from the uploaded file..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 
                       focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none 
                       transition-all duration-200 text-text-DEFAULT bg-white"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleUpload}
              className={`flex items-center justify-center bg-primary text-white px-6 py-3 rounded-lg font-semibold 
                hover:bg-primary/90 transition-all duration-200 shadow-smooth hover:shadow-md
                ${loadingUpload || !file ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={loadingUpload || !file}
            >
              {loadingUpload ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Uploading...
                </span>
              ) : (
                "Upload & Extract"
              )}
            </button>
            <button
              onClick={() => handleAskAI(question)}
              className={`flex items-center justify-center bg-accent text-white px-6 py-3 rounded-lg font-semibold 
                hover:bg-accent/90 transition-all duration-200 shadow-smooth hover:shadow-md
                ${loadingAsk || !question ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={loadingAsk || !question}
            >
              {loadingAsk ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Asking AI...
                </span>
              ) : (
                "Ask AI"
              )}
            </button>
          </div>
        </section>

        {/* Conditional rendering for AI Responses and Ranking */}
        {(togetherResponse || llamaResponse || loadingAsk) ? (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Together.ai Response Card */}
              <div
                className={`bg-background-card p-6 rounded-xl shadow-elevate transition-all duration-300 ease-in-out hover:shadow-premium hover:-translate-y-1
                  ${rankedBetter === "A" ? "border-2 border-primary" : "border border-gray-200"}`}
              >
                <h3 className="text-xl font-heading text-primary mb-4 flex items-center justify-between">
                  <span className="flex items-center"><span className="mr-3 text-2xl text-accent">💬</span> Together.ai Response</span>
                  {togetherResponse && !loadingAsk && (
                    <button
                      onClick={() => copyToClipboard(togetherResponse)}
                      className="text-text-secondary hover:text-primary text-sm flex items-center px-2 py-1 rounded-md transition-all duration-200 hover:bg-gray-100"
                      title="Copy response"
                    >
                      <span className="mr-1">📋</span> Copy
                    </button>
                  )}
                </h3>
                {loadingAsk ? (
                  <SkeletonLoader />
                ) : (
                  <p className="whitespace-pre-wrap text-text-DEFAULT text-sm">
                    {togetherResponse || "Response will appear here..."}
                  </p>
                )}
              </div>

              {/* LLaMA Response Card */}
              <div
                className={`bg-background-card p-6 rounded-xl shadow-elevate transition-all duration-300 ease-in-out hover:shadow-premium hover:-translate-y-1
                  ${rankedBetter === "B" ? "border-2 border-primary" : "border border-gray-200"}`}
              >
                <h3 className="text-xl font-heading text-primary mb-4 flex items-center justify-between">
                  <span className="flex items-center"><span className="mr-3 text-2xl text-accent-secondary">🦙</span> LLaMA Response</span>
                  {llamaResponse && !loadingAsk && (
                    <button
                      onClick={() => copyToClipboard(llamaResponse)}
                      className="text-text-secondary hover:text-primary text-sm flex items-center px-2 py-1 rounded-md transition-all duration-200 hover:bg-gray-100"
                      title="Copy response"
                    >
                      <span className="mr-1">📋</span> Copy
                    </button>
                  )}
                </h3>
                {loadingAsk ? (
                  <SkeletonLoader />
                ) : (
                  <p className="whitespace-pre-wrap text-text-DEFAULT text-sm">
                    {llamaResponse || "Response will appear here..."}
                  </p>
                )}
              </div>
            </section>

            {/* AI Ranking Result Section */}
            {(rankedBetter || rankedReason) && !loadingAsk && (
              <section className="bg-gradient-to-r from-accent to-accent-secondary p-6 rounded-xl shadow-premium text-white mb-8 transition-all duration-300 hover:scale-[1.005]">
                <h3 className="text-2xl font-heading text-center mb-4 flex items-center justify-center">
                  <span className="mr-3 text-3xl">🏆</span> AI Ranking Result <span className="ml-3 text-3xl">🏆</span>
                </h3>
                <div className="space-y-3 text-center">
                    <p className="flex items-center justify-center">
                        <strong className="mr-2 text-lg">✨ Better Answer:</strong>{" "}
                        {rankedBetter === "A" ? (
                            <span className="font-semibold text-white">Together.ai</span>
                        ) : rankedBetter === "B" ? (
                            <span className="font-semibold text-white">LLaMA</span>
                        ) : (
                            <span className="italic text-white/90">{rankedBetter}</span>
                        )}
                    </p>
                    <p className="flex flex-col items-center">
                        <strong className="mb-1 text-lg">💡 Reason:</strong>{" "}
                        <span className="text-white/90 text-sm italic">{rankedReason}</span>
                    </p>
                </div>
              </section>
            )}
          </>
        ) : (
          // Empty state / Feature Placeholder when no question has been asked
          <section className="bg-background-card p-10 rounded-xl shadow-elevate text-center flex flex-col items-center justify-center min-h-[300px]">
            <span className="text-6xl mb-6">💡</span> {/* Engaging icon */}
            <h2 className="text-3xl font-heading text-primary mb-4">Start Your Learning Journey!</h2>
            <p className="text-text-secondary max-w-lg mb-6">
              Upload a document or type your question above to get AI-powered insights,
              summaries, and answers from multiple advanced models.
            </p>
            <p className="text-sm text-text-secondary">It's simple, fast, and intelligent!</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;