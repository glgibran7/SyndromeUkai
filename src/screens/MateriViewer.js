import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MateriViewer = ({ route, navigation }) => {
  const { url, title } = route.params;
  const [user, setUser] = useState({
    name: 'Peserta',
    paket: 'Premium',
  });

  useEffect(() => {
    const getUserData = async () => {
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
    getUserData();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#9D2828" />

      {/* Header mirip MateriListScreen */}
      <LinearGradient
        colors={['#9D2828', '#191919']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        {/* Logo tengah */}
        <Image
          source={require('../../src/img/logo_putih.png')}
          style={styles.logo}
        />

        {/* Info user kanan */}
        <View style={styles.userInfo}>
          <View style={styles.paketBadge}>
            <Text style={styles.paketText}>🥇 {user.paket}</Text>
          </View>
          <View style={styles.avatarInitial}>
            <Text style={styles.avatarText}>{user.name.split(' ')[0][0]}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Title bar dengan warna sama seperti header */}
      <LinearGradient
        colors={['#9D2828', '#191919']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.titleBar}
      >
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>
      </LinearGradient>

      {/* WebView untuk tampilkan file */}
      <WebView source={{ uri: url }} startInLoadingState style={{ flex: 1 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginLeft: -80,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paketBadge: {
    backgroundColor: '#feb600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  paketText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  avatarInitial: {
    width: 35,
    height: 35,
    borderRadius: 999,
    backgroundColor: '#0b62e4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  titleBar: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  titleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'capitalize',
  },
});

export default MateriViewer;
