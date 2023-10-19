import instance from "./axios";

export const Api_Url = process.env.REACT_APP_BASE_URL;
export const Avatar_Url = process.env.REACT_APP_DEFAULT_AVATAR

console.log(Api_Url)

instance.interceptors.request.use((config) => {
    const token = localStorage.token;
    console.log(token, 666)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(token)
    return config;
});

export default Api_Url;
