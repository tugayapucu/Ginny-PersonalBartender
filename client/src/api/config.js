import axios from "axios";

// 🏗️ **Base API Configuration**
// This creates a reusable axios instance with common settings
const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 **Request Interceptor - Automatic Auth Token**
// This automatically adds the auth token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 **Response Interceptor - Global Error Handling**
// This handles common errors across all API calls
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-logout on 401 (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // Log errors for debugging
    console.error("API Error:", error.response?.data || error.message);

    return Promise.reject(error);
  }
);

export default API;
