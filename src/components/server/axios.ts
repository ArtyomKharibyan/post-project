import axios from 'axios';

const baseURL = process.env.REACT_APP_BASE_URL;

console.log(process.env.REACT_APP_TITLE)

const instance = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
    },
});


export default instance