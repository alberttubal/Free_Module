// services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { parseBackendError } from '../utils/errors';


const API_URL = process.env.NEXT_PUBLIC_API_URL;
const JWT_KEY = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'auth_token';


if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is required');


const instance: AxiosInstance = axios.create({
baseURL: API_URL,
timeout: 15000,
});


// Request interceptor to attach JWT
instance.interceptors.request.use((config: AxiosRequestConfig) => {
const token = typeof window !== 'undefined' ? localStorage.getItem(JWT_KEY) : null;
if (token && config.headers) {
config.headers['Authorization'] = `Bearer ${token}`;
}
return config;
});


// Response interceptor to normalize error
instance.interceptors.response.use(
(res) => res,
async (error) => {
// If 429, use exponential backoff (client-side), then reject with parsed error
if (error?.response?.status === 429) {
// throw a custom error so callers can trigger retries/backoff UI
const parsed = parseBackendError(error.response?.data) || { message: 'Rate limit' };
const custom = new Error(parsed.message || 'Too many requests');
// attach code
(custom as any).status = 429;
(custom as any).backend = parsed;
return Promise.reject(custom);
}


const parsed = parseBackendError(error?.response?.data) || { message: error.message };
const e = new Error(parsed.message);
(e as any).backend = parsed;
return Promise.reject(e);
}
);


// Helpers
export const buildPaginationParams = ({ limit = 20, offset = 0 } = {}) => ({ limit, offset });


export default instance;