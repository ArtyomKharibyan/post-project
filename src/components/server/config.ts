import instance from "./axios";

// move to env
export const Api_Url = "https://ba15-37-252-83-184.ngrok-free.app/api";

instance.interceptors.request.use((config) => {
    const token = localStorage.token;
    console.log(token, 12121)
        config.headers.Authorization = `Bearer ${token}` || '';
    return config;
});

export default Api_Url;
