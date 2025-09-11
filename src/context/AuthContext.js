import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetTo } from '../utils/NavigationService';
import Api from '../utils/Api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Load user dari AsyncStorage saat app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserState(parsedUser);

          // Navigasi otomatis
          if (
            parsedUser.role === 'mentor' ||
            (parsedUser.role === 'peserta' && parsedUser.nama_kelas)
          ) {
            resetTo('Main');
          } else if (parsedUser.role === 'peserta') {
            resetTo('Paket');
          }
        }
      } catch (err) {
        console.error('Gagal mengambil data user:', err);
      }
    };
    loadUser();
  }, []);

  const setUser = async newUser => {
    try {
      setUserState(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (err) {
      console.warn('Gagal menyimpan user ke storage:', err);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      try {
        await Api.post('/auth/logout');
      } catch (err) {
        console.warn('Logout API gagal:', err?.message);
      }

      await AsyncStorage.clear();
      resetTo('Login');
    } catch (err) {
      console.error('Gagal logout:', err);
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
