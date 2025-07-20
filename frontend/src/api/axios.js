import axios from "axios";

const instance = axios.create({
  baseURL: "https://synexis-backend-j6ry.onrender.com", // ✅ Your live backend
  withCredentials: true, // ✅ Needed for sending session cookies
});

export default instance;
