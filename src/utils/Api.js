import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { resetTo } from './NavigationService';
import { API_BASE_URL } from '@env';

// Flag global biar logout hanya sekali
let isLogoutTriggered = false;

const Api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor request: tambahkan token
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

// Interceptor response: handle error 401
Api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const statusMessage = error.response?.data?.status;
      const apiMessage = error.response?.data?.message;

      // Jika username/password salah → jangan logout global
      if (statusMessage === 'Invalid username or password') {
        return Promise.reject(error);
      }

      // Token expired
      if (statusMessage === 'Token expired, Login ulang') {
        if (!isLogoutTriggered) {
          isLogoutTriggered = true;
          Alert.alert(
            'Sesi Berakhir',
            'Sesi Anda telah berakhir. Silakan login ulang.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  await AsyncStorage.clear();
                  resetTo('Login');
                  isLogoutTriggered = false; // reset flag setelah redirect
                },
              },
            ],
          );
        }
      }

      // Session invalid karena login di device lain
      if (
        statusMessage === 'Session invalid or expired' ||
        apiMessage === 'Session invalid or expired'
      ) {
        if (!isLogoutTriggered) {
          isLogoutTriggered = true;
          Alert.alert(
            'Login di perangkat lain',
            'Anda login di perangkat lain. Silakan login kembali.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  await AsyncStorage.clear();
                  resetTo('Login');
                  isLogoutTriggered = false;
                },
              },
            ],
          );
        }
      }
    }
    return Promise.reject(error);
  },
);

export default Api;
