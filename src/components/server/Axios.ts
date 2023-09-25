import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_URL,
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
    },
});
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    console.log(token)
    if (config.headers) {
        config.headers.Authorization = `Bearer ${token}` || '';
    }
    console.log(config)
    return config;
});

export default instance