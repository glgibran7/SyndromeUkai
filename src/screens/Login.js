import React, { useState } from 'react';
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
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import FontAwesome6 from '@react-native-vector-icons/fontawesome';
import Api from '../utils/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false); // 🔥 state loading

  const handleLogin = async () => {
    setLoading(true); // mulai loading
    try {
      const response = await Api.post('/auth/login', { email, password });

      const {
        access_token,
        id_user,
        nama,
        email: userEmail,
        role,
        nama_kelas,
      } = response.data;

      await AsyncStorage.setItem('token', access_token);
      await AsyncStorage.setItem(
        'user',
        JSON.stringify({ id_user, nama, email: userEmail, role, nama_kelas }),
      );

      if (role === 'admin' || role === 'mentor') {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else if (role === 'peserta') {
        if (nama_kelas) {
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'Paket' }] });
        }
      } else {
        Alert.alert('Login Gagal', 'Role tidak dikenali!');
      }
    } catch (error) {
      console.error('Login gagal:', error);
      Alert.alert('Login Gagal', 'Email atau password salah!');
    } finally {
      setLoading(false); // selesai loading
    }
  };

  return (
    <LinearGradient
      colors={['#ffffff', 'rgba(255,0,0,0.18)']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <StatusBar barStyle={'dark-content'} />

        {/* Gambar */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../src/img/img_login.png')}
            style={styles.image}
          />
        </View>

        {/* Konten */}
        <View style={styles.content}>
          <Text style={styles.loginTitle}>SELAMAT DATANG</Text>
          <Text style={styles.label}>
            Platform penyedia layanan Pendidikan Farmasi berbasis teknologi{' '}
            <Text style={[styles.label, { fontWeight: 'bold' }]}>
              terbaik dan termurah
            </Text>
          </Text>

          {/* Input Email */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail" size={18} color="gray" style={styles.icon} />
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

          {/* Input Password */}
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

          {/* Lupa Password */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPassword}>Lupa Password?</Text>
          </TouchableOpacity>

          {/* Tombol Login */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.tombol}
              onPress={handleLogin}
              disabled={loading} // disable saat loading
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Tombol Sign Up */}
          <View style={styles.buttonContainerSignUp}>
            <TouchableOpacity
              style={styles.tombolSignUp}
              onPress={() => navigation.navigate('SignUp')}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 🔥 Overlay Loading */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 10, fontSize: 16 }}>
            Sedang masuk...
          </Text>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  tombol: {
    backgroundColor: '#a81414ff',
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  tombolSignUp: {
    backgroundColor: '#feb600ff',
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  inputtext: {
    flex: 1,
    color: '#000',
    paddingHorizontal: 10,
    fontSize: 14,
  },
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
  icon: {
    marginLeft: 5,
  },
  iconPassword: {
    marginLeft: 9,
  },
  iconRight: {
    marginRight: 5,
  },
  loginTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: -12,
  },

  label: {
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  forgotPassword: {
    color: '#000000ff',
    fontSize: 13,
    textAlign: 'right',
    marginRight: 20,
    marginTop: 2,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonContainerSignUp: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Login;
