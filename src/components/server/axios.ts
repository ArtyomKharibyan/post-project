import axios, {AxiosInstance} from "axios";

export const baseURL = process.env.REACT_APP_BASE_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
