import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  SafeAreaView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import FontAwesome6 from '@react-native-vector-icons/fontawesome';
import Api from '../utils/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useToast } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const Login = ({ navigation }) => {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));
  const [translateYAnim] = useState(new Animated.Value(50));
  const [rotationAnim] = useState(new Animated.Value(0)); // Rotation Animation
  const { show } = useToast();

  useEffect(() => {
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
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // Start the rotating animation for spinner
    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 1000, // Speed of rotation
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const handleLogin = async () => {
    setLoading(true);

    if (!email || !password) {
      show('Email atau Password tidak boleh kosong!', 'warning');
      setLoading(false);
      return;
    }

    try {
      const response = await Api.post('/auth/login/mobile', {
        email,
        password,
      });

      const {
        access_token,
        id_user,
        nama,
        email: userEmail,
        role,
        nama_kelas,
        id_paketkelas,
      } = response.data;

      await AsyncStorage.setItem('token', access_token);

      let finalNamaKelas = nama_kelas;
      let finalIdPaketKelas = id_paketkelas;

      if (role === 'peserta' && !nama_kelas) {
        try {
          const kelasRes = await Api.get('/profile/kelas-saya', {
            headers: { Authorization: `Bearer ${access_token}` },
          });

          if (kelasRes.data?.data?.length > 0) {
            finalNamaKelas = kelasRes.data.data[0].nama_kelas;
            finalIdPaketKelas = kelasRes.data.data[0].id_paketkelas;
          }
        } catch (err) {
          console.warn('Gagal ambil kelas peserta:', err);
        }
      }

      const userData = {
        id_user,
        name: nama,
        email: userEmail,
        role,
        nama_kelas: finalNamaKelas || null,
        id_paketkelas: finalIdPaketKelas || null,
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      show('Login berhasil!', 'success');

      if (role === 'peserta' && userData.nama_kelas) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else if (role === 'peserta') {
        navigation.reset({ index: 0, routes: [{ name: 'Paket' }] });
      } else if (role === 'mentor') {
        navigation.reset({ index: 0, routes: [{ name: 'HomeMentor' }] });
      } else {
        show('Role tidak dikenali!', 'warning');
      }
    } catch (err) {
      console.error('Login gagal:', err);
      show('Email atau password salah!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Custom Spinner Animation
  const rotateInterpolate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <LinearGradient
        colors={['#ffffff', 'rgba(255,0,0,0.18)']}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <StatusBar barStyle={'dark-content'} backgroundColor="#fff" />

          <Animated.View
            style={[
              styles.imageContainer,
              { transform: [{ translateY: translateYAnim }] },
            ]}
          >
            <Image
              source={require('../../src/img/dokter_mobile.png')}
              style={styles.image}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={styles.loginTitle}>SELAMAT DATANG</Text>
            <Text style={styles.label}>
              Platform penyedia layanan Pendidikan Farmasi berbasis teknologi{' '}
              <Text style={{ fontWeight: 'bold' }}>terbaik dan termurah</Text>
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail"
                size={18}
                color="gray"
                style={styles.icon}
              />
              <TextInput
                value={email}
                style={styles.inputtext}
                placeholder="Masukkan Email"
                placeholderTextColor="gray"
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <FontAwesome6
                name="lock"
                size={21}
                color="gray"
                style={styles.iconPassword}
              />
              <TextInput
                value={password}
                style={styles.inputtext}
                placeholder="Masukkan Password"
                placeholderTextColor="gray"
                onChangeText={setPassword}
                secureTextEntry={secureText}
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                <FontAwesome6
                  name={secureText ? 'eye-slash' : 'eye'}
                  size={20}
                  color="gray"
                  style={styles.iconRight}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPassword}>Lupa Password?</Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.tombol}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <Animated.View
                    style={{
                      transform: [{ rotate: rotateInterpolate }],
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={[
                        styles.spinner,
                        { width: 40, height: 40, borderWidth: 4 },
                      ]}
                    />
                  </Animated.View>
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* <View style={styles.buttonContainerSignUp}>
              <TouchableOpacity
                style={styles.tombolSignUp}
                onPress={() => navigation.navigate('SignUp')}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View> */}
          </Animated.View>

          <Modal visible={loading} transparent animationType="fade">
            <View style={styles.overlay}>
              <Animated.View
                style={{
                  transform: [{ rotate: rotateInterpolate }],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={[
                    styles.spinner,
                    { width: 60, height: 60, borderWidth: 6 },
                  ]}
                />
              </Animated.View>
              <Text style={{ color: '#fff', marginTop: 10 }}>
                Sedang masuk...
              </Text>
            </View>
          </Modal>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tombol: {
    backgroundColor: '#a81414',
    marginVertical: 15,
    paddingVertical: isTablet ? 20 : 15,
    paddingHorizontal: 40,
    width: isTablet ? width * 0.25 : width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'center',
  },

  tombolSignUp: {
    backgroundColor: '#feb600',
    marginVertical: 15,
    paddingVertical: isTablet ? 20 : 15,
    paddingHorizontal: 40,
    width: isTablet ? width * 0.25 : width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'center',
  },

  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: isTablet ? 30 : 20,
  },

  buttonContainerSignUp: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: isTablet ? 20 : 10,
  },

  inputtext: {
    flex: 1,
    color: '#000',
    paddingHorizontal: isTablet ? 15 : 10,
    fontSize: isTablet ? 18 : 14,
  },

  inputWrapper: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: isTablet ? 30 : 10,
    marginVertical: isTablet ? 10 : 5,
    paddingHorizontal: isTablet ? 20 : 10,
    paddingVertical: isTablet ? 14 : 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: { marginLeft: isTablet ? 10 : 5 },

  iconPassword: { marginLeft: isTablet ? 15 : 9 },

  iconRight: { marginRight: isTablet ? 10 : 5 },

  loginTitle: {
    paddingHorizontal: 10,
    fontSize: isTablet ? 45 : 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: isTablet ? 'center' : 'center',
    marginTop: isTablet ? 10 : -25,
  },

  label: {
    color: '#000',
    textAlign: isTablet ? 'center' : 'center',
    marginBottom: isTablet ? 20 : 10,
    paddingHorizontal: 10,
    fontSize: isTablet ? 18 : 12,
    width: isTablet ? '95%' : '100%',
  },

  forgotPassword: {
    color: '#000',
    fontSize: isTablet ? 18 : 13,
    textAlign: isTablet ? 'right' : 'right',
    marginRight: isTablet ? 0 : 20,
    marginTop: 5,
    width: isTablet ? '95%' : '100%',
  },

  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: isTablet ? 24 : 18,
  },

  imageContainer: {
    alignItems: 'center',
    marginTop: isTablet ? 20 : 40,
  },

  image: {
    width: isTablet ? width * 0.35 : width * 0.7,
    height: isTablet ? width * 0.35 : width * 0.7,
    resizeMode: 'contain',
  },

  content: {
    flex: 1,
    paddingHorizontal: isTablet ? 80 : 30,
    marginTop: isTablet ? 40 : 20,
    alignSelf: 'center',
    width: isTablet ? '60%' : '100%',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  spinner: {
    borderRadius: 50,
    borderColor: '#fff',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
    borderRightColor: '#fff',
    borderWidth: 4,
    borderStyle: 'solid',
    animationDuration: '1s',
    animationName: 'spin',
  },
});

export default Login;
