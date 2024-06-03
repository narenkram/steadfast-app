import axios from 'axios';
import store from '../stores/store';
import { GET_USER_TOKEN_GETTER } from '@/stores/storeconstants'

const axiosInstance = axios.create({
    baseURL: 'https://api.dhan.co/',
});

axiosInstance.interceptors.request.use((config) => {
    let params = new URLSearchParams();
    let token = store.getters[`auth/${GET_USER_TOKEN_GETTER}`];
    params.append('auth', token);
    config.params = params;
    return config;
});

export default axiosInstance;


