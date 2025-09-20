// context/KelasContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/Api';
export const KelasContext = createContext();

export const KelasProvider = ({ children }) => {
  const [kelasList, setKelasList] = useState([]);
  const [kelasUser, setKelasUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil daftar kelas user
  const fetchKelasUser = async () => {
    try {
      setLoading(true);
      const res = await Api.get('/profile/kelas-saya');
      if (res?.data) {
        setKelasList(res.data);

        // cek kelas yang terakhir dipilih (dari storage)
        const stored = await AsyncStorage.getItem('kelasUser');
        if (stored) {
          const parsed = JSON.parse(stored);
          const stillExist = res.data.find(
            k => k.id_paketkelas == parsed.id_paketkelas,
          );
          if (stillExist) {
            setKelasUser(stillExist);
            return;
          }
        }

        // default pilih kelas pertama
        if (res.data.length > 0) {
          setKelasUser(res.data[0]);
          await AsyncStorage.setItem('kelasUser', JSON.stringify(res.data[0]));
        }
      }
    } catch (err) {
      console.error('Gagal ambil kelas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ganti kelas
  const gantiKelas = async kelas => {
    setKelasUser(kelas);
    await AsyncStorage.setItem('kelasUser', JSON.stringify(kelas));
  };

  useEffect(() => {
    fetchKelasUser();
  }, []);

  return (
    <KelasContext.Provider
      value={{
        kelasList,
        kelasUser,
        gantiKelas,
        loading,
        refresh: fetchKelasUser,
      }}
    >
      {children}
    </KelasContext.Provider>
  );
};
