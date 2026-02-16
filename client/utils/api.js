import axios from "axios";

// Create an Axios instance with default configuration
const API = axios.create({
    baseURL: "http://localhost:5000/api", // Adjust if backend port is different
});

// Add a request interceptor to include the token in headers
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;
