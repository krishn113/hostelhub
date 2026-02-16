import axios from "axios";

// 1. Use env variable for flexibility between development and production
const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

// Request interceptor (Your existing logic + clean check)
API.interceptors.request.use(
    (config) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Response interceptor for global error handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 (Expired or Invalid Token)
        if (error.response && error.response.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                window.location.href = "/login"; // Force redirect to login
            }
        }
        return Promise.reject(error);
    }
);

export default API;