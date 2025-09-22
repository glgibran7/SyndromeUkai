import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import Api from '../utils/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';

const { width } = Dimensions.get('window');

const HomeMentor = () => {
  const navigation = useNavigation();
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWaliKelas, setIsWaliKelas] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then(u => {
      if (u) setUser(JSON.parse(u));
    });
  }, []);

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const endpoint = isWaliKelas
          ? '/paket-kelas/wali-kelas'
          : '/paket-kelas/mentor';

        const response = await Api.get(endpoint);
        setKelasList(response.data.data || []);
      } catch (error) {
        console.error('Gagal mengambil kelas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKelas();
  }, [isWaliKelas]);

  const handleKelasClick = async kelas => {
    await AsyncStorage.setItem('kelas', kelas.id_paketkelas.toString());
    await AsyncStorage.setItem(
      'namaKelas',
      JSON.stringify({ namaKelas: kelas.nama_kelas }),
    );
    navigation.navigate('Main');
  };

  return (
    <LinearGradient
      colors={['#9D2828', '#191919']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <Header navigation={navigation} />

        {/* Greeting */}
        <View style={styles.greetingBox}>
          <Text style={styles.greeting}>Hi, {user?.name}</Text>
          <Text style={styles.subtext}>
            Pilih kelas yang Anda ampu untuk masuk ke materi
          </Text>

          {/* Toggle Wali Kelas */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Wali Kelas</Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                isWaliKelas ? styles.toggleOn : styles.toggleOff,
              ]}
              onPress={() => setIsWaliKelas(prev => !prev)}
            >
              <View style={[styles.circle, isWaliKelas && styles.circleOn]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.mainContent}>
          <Text style={styles.sectionTitle}>Kelas Anda</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#9D2828"
              style={{ marginTop: 50 }}
            />
          ) : kelasList.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#555', marginTop: 20 }}>
              Anda belum memiliki kelas.
            </Text>
          ) : (
            <View style={styles.menuGrid}>
              {kelasList.map((kelas, idx) => {
                // dummy jumlah notif
                const notifCount = kelas.notifCount || (idx % 2 === 0 ? 3 : 0); // contoh: selang-seling

                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.menuItem}
                    onPress={() => handleKelasClick(kelas)}
                  >
                    {/* Badge Notifikasi hanya kalau notif > 0 */}
                    {notifCount > 0 && (
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{notifCount}</Text>
                      </View>
                    )}

                    <Text style={styles.menuTitle}>{kelas.nama_kelas}</Text>
                    <Text style={styles.menuDesc}>{kelas.nama_batch}</Text>
                    <View style={styles.menuIconContainer}>
                      <Ionicons
                        name="school-outline"
                        size={35}
                        color="#700101"
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  greetingBox: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  greeting: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  subtext: {
    fontSize: 13,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  toggleContainer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#fff',
    marginRight: 10,
  },
  toggle: {
    width: 50,
    height: 25,
    borderRadius: 20,
    justifyContent: 'center',
    padding: 3,
  },
  toggleOff: { backgroundColor: '#ccc' },
  toggleOn: { backgroundColor: '#4caf50' },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  circleOn: {
    alignSelf: 'flex-end',
  },
  mainContent: {
    backgroundColor: 'white',
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginTop: 20,
    minHeight: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: width * 0.42,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#FFF8E3',
    alignItems: 'center',
  },
  menuTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#700101',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  menuDesc: {
    fontSize: 12,
    color: '#555',
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  menuIconContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E53935',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default HomeMentor;
