import instance from "./axios";

export const Api_Url = process.env.REACT_APP_BASE_URL;

console.log(Api_Url)

instance.interceptors.request.use((config) => {
    const token = localStorage.token;
        config.headers.Authorization = `Bearer ${token}` || '';
    return config;
});

export default Api_Url;
