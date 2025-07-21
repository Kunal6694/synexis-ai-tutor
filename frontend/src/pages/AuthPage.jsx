import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isSignUp ? "/api/register" : "/api/login";
    const payload = isSignUp
      ? { name: formData.name, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      const response = await axios.post(endpoint, payload);
      if (isSignUp) {
        setIsSignUp(false);
        setFormData({ name: "", email: "", password: "" });
        setError("✅ Account created! Please log in.");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 md:p-12 
                    bg-gradient-to-br from-background-DEFAULT to-accent-secondary font-sans text-text-DEFAULT">
      
      <div className="w-full max-w-md bg-background-card rounded-2xl shadow-premium p-8 sm:p-10 transition-all duration-500 ease-in-out">
        
        <h1 className="text-5xl font-heading text-center text-primary mb-8 tracking-wider">
          SynExis AI Tutor
        </h1>

        <h2 className="text-3xl font-heading text-center text-primary mb-4">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        <p className="text-center text-text-secondary mb-6 text-sm">
          {isSignUp ? "Join us to get started with AI-powered learning." : "Sign in to continue your learning journey."}
        </p>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setIsSignUp(true)}
            className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 ease-in-out
              ${isSignUp ? 'bg-primary text-white shadow-smooth' : 'bg-transparent text-primary border border-primary hover:bg-primary/90 hover:text-white hover:shadow-sm'}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setIsSignUp(false)}
            className={`ml-4 px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 ease-in-out
              ${!isSignUp ? 'bg-primary text-white shadow-smooth' : 'bg-transparent text-primary border border-primary hover:bg-primary/90 hover:text-white hover:shadow-sm'}`}
          >
            Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={handleChange}
              value={formData.name}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 
                         focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all duration-200"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={formData.email}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 
                       focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all duration-200"
            required
          />
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              value={formData.password}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 
                         focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all duration-200"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-primary transition"
            >
              {showPassword ? (
                <span>👁️‍🗨️</span>
              ) : (
                <span>👁️</span>
              )}
            </button>
          </div>

          {error && (
            <p className={`text-sm flex items-center ${error.startsWith("✅") ? "text-green-600" : "text-accent"}`}>
              <span className="mr-2">
                  {error.startsWith("✅") ? "✔️" : "❌"}
              </span>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 shadow-smooth hover:shadow-md"
          >
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;