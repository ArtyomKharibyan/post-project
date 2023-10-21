import instance from "./axios";

export const Api_Url = process.env.REACT_APP_BASE_URL;

instance.interceptors.request.use((config) => {
    const token = localStorage.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(token)
    return config;
});

export default Api_Url;
