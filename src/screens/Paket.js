import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/Api'; // pastikan path sesuai

const { width } = Dimensions.get('window');

const Paket = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const packages = [
    {
      id: 1,
      title: 'Paket Premium 70X',
      detail: '12x Intensif, 4–5 jam\n60x Online',
      icon: require('../../src/img/premium.png'),
    },
    {
      id: 2,
      title: 'Paket Silver 24X',
      detail: '12x Intensif, 4–5 jam\n12x Online',
      icon: require('../../src/img/silver.png'),
    },
    {
      id: 3,
      title: 'Paket Gold 73X',
      detail: '12x Intensif, 4–5 jam\n60x Online',
      icon: require('../../src/img/gold.png'),
    },
    {
      id: 4,
      title: 'Paket Diamond 27X',
      detail: '12x Intensif, 4–5 jam\n12x Online, 3x Kelas OSCE',
      icon: require('../../src/img/diamond.png'),
    },
  ];

  // 🔹 API /auth/me
  const fetchUserFromAPI = async () => {
    try {
      const res = await Api.get('/profile');
      return res.data.data;
    } catch (err) {
      console.error('Error fetch /profile:', err);
      return null;
    }
  };

  const handleKelasSaya = async () => {
    setLoading(true);
    const user = await fetchUserFromAPI();
    setLoading(false);

    if (!user || user.nama_kelas === null) {
      Alert.alert(
        'Info',
        'Belum ada paket terdaftar, silahkan beli paket terlebih dahulu untuk mengakses kelas.',
        [
          { text: 'Oke', style: 'default' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                await AsyncStorage.clear();
                navigation.replace('Login');
              } catch (err) {
                console.error('Gagal logout:', err);
              }
            },
          },
        ],
      );
    } else {
      navigation.navigate('Main');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9D2828' }}>
      <LinearGradient
        colors={['#a10505', '#ff00004d']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}>
          <StatusBar barStyle="light-content" backgroundColor="#a10505" />

          {/* Header */}
          <View style={styles.headerContainer}>
            <Image
              source={require('../../src/img/logo_putih.png')}
              style={styles.headerImage}
            />
            <Text style={styles.subtitle}>
              Platform penyedia layanan pendidikan farmasi
              {'\n'}
              <Text style={{ fontWeight: 'bold' }}>terbaik dan ter-murah</Text>
            </Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Pilih Paket</Text>

            {packages.map(pkg => (
              <TouchableOpacity
                key={pkg.id}
                style={styles.packageCard}
                onPress={() =>
                  navigation.navigate('PaketDetail', { paketId: pkg.id })
                }
              >
                <Image source={pkg.icon} style={styles.icon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.packageTitle}>{pkg.title}</Text>
                  <Text style={styles.packageDescription}>{pkg.detail}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Tombol Kelas Saya */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleKelasSaya}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Kelas Saya</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerImage: {
    width: width * 0.7,
    height: width * 0.4,
    resizeMode: 'contain',
  },
  subtitle: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    marginTop: -5,
  },
  content: {
    paddingHorizontal: 30,
    marginTop: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  packageCard: {
    backgroundColor: '#a10505',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  icon: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginRight: 15,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  packageDescription: {
    fontSize: 13,
    color: 'white',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#feb600',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Paket;
