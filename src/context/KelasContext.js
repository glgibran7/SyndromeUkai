import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/Api';
import { AuthContext } from './AuthContext';

export const KelasContext = createContext();

export const KelasProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [kelasAktif, setKelasAktif] = useState(null);
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [isLoadingKelas, setIsLoadingKelas] = useState(true);
  const [isWaliKelas, setIsWaliKelas] = useState(false); // 🔥 toggle wali kelas

  const loadKelas = async () => {
    if (!user) return;
    setIsLoadingKelas(true);
    try {
      const token = await AsyncStorage.getItem('token');
      let list = [];

      if (user.role === 'mentor') {
        const endpoint = isWaliKelas
          ? '/paket-kelas/wali-kelas'
          : '/paket-kelas/mentor';

        const res = await Api.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        list = res.data?.data || [];

        setDaftarKelas(list);

        if (list.length > 0 && !kelasAktif) {
          setKelasAktif(list[0]);
          await AsyncStorage.setItem('kelas', list[0].id_paketkelas.toString());
          await AsyncStorage.setItem('namaKelas', list[0].nama_kelas);
        }
      } else if (user.role === 'peserta') {
        const res = await Api.get('/profile/kelas-saya', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const kelasPeserta = res.data?.data?.[0];
        if (kelasPeserta) {
          setKelasAktif(kelasPeserta);
          setDaftarKelas([kelasPeserta]); // konsisten array
          await AsyncStorage.setItem(
            'kelas',
            kelasPeserta.id_paketkelas.toString(),
          );
          await AsyncStorage.setItem('namaKelas', kelasPeserta.nama_kelas);
        }
      }
    } catch (err) {
      console.error('Gagal ambil daftar kelas:', err);
    } finally {
      setIsLoadingKelas(false);
    }
  };

  useEffect(() => {
    loadKelas();
  }, [user, isWaliKelas]); // 🔥 refetch setiap kali toggle berubah

  return (
    <KelasContext.Provider
      value={{
        kelasAktif,
        setKelasAktif,
        daftarKelas,
        isLoadingKelas,
        isWaliKelas,
        setIsWaliKelas, // 🔥 biar bisa dipanggil di Header
        loadKelas,
      }}
    >
      {children}
    </KelasContext.Provider>
  );
};
