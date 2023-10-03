import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://192.168.10.81:5000',
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
    },
});
instance.interceptors.request.use((config) => {
    const token = localStorage.token;
    console.log(token, 45)
    if (config.headers) {
        config.headers.Authorization = `Bearer ${token}` || '';
    }
    return config;
});


export default instance