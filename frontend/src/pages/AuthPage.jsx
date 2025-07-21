import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
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
        setFormData({ name: "", email: "", password: "" }); // Clear form on successful sign-up
        setError("✅ Account created! Please log in.");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-5xl flex bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Left Panel (Sign In promotion) */}
        <div
          className={`w-1/2 bg-teal-500 text-white flex flex-col items-center justify-center p-10 
            transition-transform duration-500 ease-in-out ${
            isSignUp ? "translate-x-0" : "-translate-x-full absolute md:relative"
          } md:relative`}
        >
          {/* SynExis Branding */}
          <h1 className="text-5xl font-extrabold mb-6 tracking-wide drop-shadow-md">
            SynExis AI Tutor
          </h1>
          {/* End SynExis Branding */}

          <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="mb-6 text-center">
            To keep connected with us please login with your personal info
          </p>
          <button
            className="px-6 py-2 border border-white rounded-full font-medium hover:bg-white hover:text-teal-500 transition"
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
        </div>

        {/* Right Panel (Auth Form) */}
        <div
          className={`w-1/2 p-10 flex flex-col justify-center 
            transition-transform duration-500 ease-in-out ${
            isSignUp ? "translate-x-full md:translate-x-0" : "translate-x-0"
          } absolute md:relative w-full md:w-1/2`}
        > {/* FIX: Closing backtick was missing before this closing `}` */}
          <h2 className="text-3xl font-bold text-teal-500 mb-4">
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>

          <p className="text-gray-500 mb-4 text-sm">
            or use your email for {isSignUp ? "registration" : "login"}:
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                onChange={handleChange}
                value={formData.name}
                className="w-full border rounded px-4 py-2"
                required
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              value={formData.email}
              className="w-full border rounded px-4 py-2"
              required
            />
            {/* Password input with toggle */}
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                value={formData.password}
                className="w-full border rounded px-4 py-2 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? (
                  <span>👁️‍🗨️</span>
                ) : (
                  <span>👁️</span>
                )}
              </button>
            </div>

            {error && (
              <p className={`text-sm flex items-center ${error.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
                <span className="mr-2">
                    {error.startsWith("✅") ? "✔️" : "❌"}
                </span>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-2 rounded-full font-medium hover:bg-teal-600 transition"
            >
              {isSignUp ? "Sign Up" : "Login"}
            </button>
          </form>

          {!isSignUp && (
            <p className="text-sm mt-4">
              Don't have an account?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-teal-500 font-semibold underline"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;