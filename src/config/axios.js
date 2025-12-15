import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

// Fetch and store CSRF token
let csrfToken = null;

export const fetchCsrfToken = async () => {
  try {
    console.log('Fetching CSRF token...');
    const response = await axios.get(`${API_BASE_URL}/csrf-token`);
    csrfToken = response.data.csrfToken;
    console.log('CSRF token fetched successfully');
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Add axios interceptor to include CSRF token in all mutating requests
axios.interceptors.request.use(async (config) => {
  const mutatingMethods = ['post', 'put', 'patch', 'delete'];
  if (mutatingMethods.includes(config.method?.toLowerCase())) {
    // Fetch token if we don't have one
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle CSRF token expiry - refetch on 403 CSRF errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 &&
        error.response?.data?.error?.includes('CSRF')) {
      // Token expired, fetch a new one and retry
      csrfToken = null;
      await fetchCsrfToken();
      if (csrfToken) {
        error.config.headers['x-csrf-token'] = csrfToken;
        return axios(error.config);
      }
    }
    return Promise.reject(error);
  }
);

// Fetch token on module load
fetchCsrfToken();

export default axios;
