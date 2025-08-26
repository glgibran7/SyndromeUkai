import { StackActions } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash = ({ navigation }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // animasi fade
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

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
  }, []);

  return (
    <LinearGradient
      colors={['#ffffff', 'rgba(255,0,0,0.18)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
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
    width: 200,
    height: 80,
    marginBottom: 30,
    borderRadius: 30,
    shadowColor: '#000',
  },
});

export default Splash;
