import { StackActions } from '@react-navigation/native';
import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  Text,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash = ({ navigation }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current; // Untuk animasi skala logo
  const translateY = React.useRef(new Animated.Value(100)).current; // Untuk animasi pergerakan logo
  const textOpacity = React.useRef(new Animated.Value(0)).current; // Untuk animasi teks

  useEffect(() => {
    // Menyembunyikan status bar
    StatusBar.setHidden(true);

    // Animasi fade dan pergerakan logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        delay: 1200, // Teks muncul setelah logo
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const checkAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');

        setTimeout(() => {
          if (userData && token) {
            const parsedUser = JSON.parse(userData);

            // 🔑 aturan navigasi
            if (
              parsedUser.role === 'peserta' &&
              parsedUser.nama_kelas !== null
            ) {
              navigation.dispatch(StackActions.replace('Main')); // ke Home
            } else {
              navigation.dispatch(StackActions.replace('Paket')); // ke Paket
            }
          } else {
            navigation.dispatch(StackActions.replace('Login'));
          }
        }, 2000); // kasih delay biar splash kelihatan dulu
      } catch (error) {
        console.error('Error cek auth:', error);
        navigation.dispatch(StackActions.replace('Login'));
      }
    };

    checkAuth();

    return () => {
      // Mengembalikan status bar ke kondisi normal setelah keluar dari splash screen
      StatusBar.setHidden(false);
    };
  }, []);

  return (
    <LinearGradient
      colors={['#ffffff', 'rgba(255,0,0,0.18)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY }],
        }}
      >
        <Image source={require('../img/bg_ukai_new.png')} style={styles.logo} />
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 100,
    borderRadius: 20,
    shadowColor: '#000',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default Splash;
