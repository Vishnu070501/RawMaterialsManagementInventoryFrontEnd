import axios from 'axios';
require('dotenv').config();

const baseURL = process.env.NEXT_PUBLIC_API_URL;
// const BASE_URL = 'http://192.168.0.117:8000/api/';

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 20000, // Set a timeout of 5 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  function (config) {
    // Check if the request URL does not match the excluded URLs
    if (!config.url.includes('signup') &&
        !config.url.includes('signin') &&
        !config.url.includes('verify-otp') &&
        !config.url.includes('send-otp')) {
      // Get the access token from local storage
      const accessToken = localStorage.getItem('accessToken');
      // Add the access token to the request headers
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Export axios instance for global use
export default axiosInstance;
