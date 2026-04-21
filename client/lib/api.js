import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true
});

// Request interceptor
const requestInterceptor = api.interceptors.request.use(
  (config) => {
   if (typeof window !== "undefined") {
    // Check for "token" OR check inside the "user" object
    let token = localStorage.getItem("token");
    
    if (!token) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      token = user.token;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}
)
// Response interceptor
const responseInterceptor = api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;