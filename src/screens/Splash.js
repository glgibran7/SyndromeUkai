// Splash.js
import { StackActions } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Animated, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash = ({ navigation }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;
  const translateY = React.useRef(new Animated.Value(100)).current;

  useEffect(() => {
    StatusBar.setHidden(true);

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
    ]).start();

    const checkAuth = async () => {
      try {
        const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
        const userData = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');

        setTimeout(() => {
          // 🔑 Cek dulu onboarding
          if (!hasOnboarded) {
            navigation.dispatch(StackActions.replace('Onboarding'));
            return;
          }

          // 🔑 Kalau sudah onboarding, cek auth
          if (userData && token) {
            const parsedUser = JSON.parse(userData);
            if (
              parsedUser.role === 'peserta' &&
              parsedUser.nama_kelas !== null
            ) {
              navigation.dispatch(StackActions.replace('Main'));
            } else {
              navigation.dispatch(StackActions.replace('Paket'));
            }
          } else {
            navigation.dispatch(StackActions.replace('Login'));
          }
        }, 2000);
      } catch (error) {
        console.error('Error cek auth:', error);
        navigation.dispatch(StackActions.replace('Login'));
      }
    };

    checkAuth();

    return () => {
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 250, height: 100, borderRadius: 20, shadowColor: '#000' },
});

export default Splash;
