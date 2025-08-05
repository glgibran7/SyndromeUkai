import { StackActions } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Splash = ({ navigation }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
    const interval = setTimeout(() => {
      navigation.dispatch(StackActions.replace('Login'));
    }, 3000);
    return () => clearTimeout(interval);
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
        {/* <Text style={styles.subtitle}>
          Bimbingan Berkualitas Untuk Apoteker Masa Depan
        </Text> */}
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#0a1f44', // Hapus atau komentar baris ini
  },
  logo: {
    width: 200,
    height: 75,
    paddingHorizontal: 40,
    marginBottom: 30,
    borderRadius: 30,
    shadowColor: '#000',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 10,
    textShadowColor: '#222',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    alignItems: 'center',
    paddingHorizontal: 30,
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 18,
    color: '#b0c4de',
    letterSpacing: 1,
    marginBottom: 10,
  },
});

export default Splash;
