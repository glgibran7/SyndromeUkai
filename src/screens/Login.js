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
  ActivityIndicator,
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

const Login = ({ navigation }) => {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));
  const [translateYAnim] = useState(new Animated.Value(50));
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
        id_paketkelas, // kalau API peserta sudah kirim, kita ambil
      } = response.data;

      // Simpan token
      await AsyncStorage.setItem('token', access_token);

      const userData = {
        id_user,
        name: nama,
        email: userEmail,
        role,
        nama_kelas,
        id_paketkelas: id_paketkelas || null, // kalau mentor default null
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      show('Login berhasil!', 'success');

      // Navigasi berdasarkan role & paket
      if (role === 'mentor' || (role === 'peserta' && nama_kelas)) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else if (role === 'peserta') {
        navigation.reset({ index: 0, routes: [{ name: 'Paket' }] });
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
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainerSignUp}>
              <TouchableOpacity
                style={styles.tombolSignUp}
                onPress={() => navigation.navigate('SignUp')}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Modal visible={loading} transparent animationType="fade">
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color="#fff" />
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
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    width: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'center',
  },
  tombolSignUp: {
    backgroundColor: '#feb600',
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    width: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'center',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonContainerSignUp: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  inputtext: { flex: 1, color: '#000', paddingHorizontal: 10, fontSize: 14 },
  inputWrapper: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 10,
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: { marginLeft: 5 },
  iconPassword: { marginLeft: 9 },
  iconRight: { marginRight: 5 },
  loginTitle: {
    paddingHorizontal: 10,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: -25,
  },
  label: {
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  forgotPassword: {
    color: '#000',
    fontSize: 13,
    textAlign: 'right',
    marginRight: 20,
    marginTop: 2,
  },
  loginButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  imageContainer: { alignItems: 'center', marginTop: 40 },
  image: { width: width * 0.7, height: width * 0.7, resizeMode: 'contain' },
  content: { flex: 1, paddingHorizontal: 30, marginTop: 20 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Login;
