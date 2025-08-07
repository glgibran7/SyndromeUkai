import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Api = axios.create({
  baseURL: 'https://api.ukaisyndrome.site',
  headers: { 'Content-Type': 'application/json' },
});

Api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

Api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.status;

      if (message === 'Token expired, Login ulang') {
        alert('Sesi Anda telah berakhir. Silakan login ulang.');
        await AsyncStorage.clear();
      }
    }
    return Promise.reject(error);
  },
);

export default Api;
