// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/Api';
import { resetTo } from '../utils/NavigationService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ name: '-', paket: '-' });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            name: parsedUser.nama || 'Peserta',
            paket: 'Premium',
          });
        }
      } catch (error) {
        console.error('Gagal mengambil data user:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      try {
        await Api.post('/auth/logout');
      } catch (err) {
        console.warn('Logout API gagal:', err?.message);
      }

      await AsyncStorage.clear();

      // Reset langsung ke Login
      resetTo('Login');
    } catch (error) {
      console.error('Gagal logout:', error);
      alert('Logout gagal, coba lagi.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, handleLogout, isLoggingOut }}>
      {children}
    </AuthContext.Provider>
  );
};
