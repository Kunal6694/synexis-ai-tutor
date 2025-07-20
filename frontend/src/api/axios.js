import axios from "axios";

const instance = axios.create({
  baseURL: "https://synexis-backend-j6ry.onrender.com", // ✅ MUST point to Render backend
  withCredentials: true,
});

export default instance;
