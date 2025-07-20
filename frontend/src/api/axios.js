import axios from 'axios';

export default axios.create({
  baseURL: 'https://synexis-backend-j6ry.onrender.com/api',
  withCredentials: true,
});
