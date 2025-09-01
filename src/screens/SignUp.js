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
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
import Api from '../utils/Api';

const SignUp = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1=email, 2=kode, 3=form lengkap
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [noHp, setNoHp] = useState(''); // ✅ Tambah state no_hp
  const [kode, setKode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  // STEP 1: kirim kode
  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Validasi', 'Email wajib diisi.');
      return;
    }
    try {
      await Api.post('/auth/register/email', { email });
      Alert.alert('Berhasil', 'Kode verifikasi telah dikirim ke email Anda.');
      setStep(2);
    } catch (error) {
      console.error('Send code error:', error);
      Alert.alert('Gagal', 'Tidak dapat mengirim kode verifikasi.');
    }
  };

  // STEP 2: verifikasi kode
  const handleVerifyCode = async () => {
    if (!kode.trim()) {
      Alert.alert('Validasi', 'Masukkan kode verifikasi.');
      return;
    }
    try {
      await Api.post('/auth/register/verify', { email, kode_pemulihan: kode });
      Alert.alert('Berhasil', 'Kode verifikasi benar. Silakan lengkapi data.');
      setStep(3);
    } catch (error) {
      console.error('Verify code error:', error);
      Alert.alert('Gagal', 'Kode verifikasi salah.');
    }
  };

  // STEP 3: daftar akun
  const handleSignUp = async () => {
    if (!nama.trim() || !password.trim() || !noHp.trim()) {
      Alert.alert('Validasi', 'Semua field wajib diisi.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validasi', 'Password dan konfirmasi password tidak cocok.');
      return;
    }
    try {
      const payload = { nama, email, no_hp: noHp, password }; // ✅ sertakan no_hp
      await Api.post('/auth/register/complete', payload);
      Alert.alert('Berhasil', 'Akun berhasil dibuat. Silakan login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat membuat akun.');
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
            source={require('../../src/img/dokter_mobile.png')}
            style={styles.image}
          />
        </View>

        {/* Konten */}
        <View style={styles.content}>
          <Text style={styles.loginTitle}>DAFTAR AKUN</Text>

          {/* STEP 1: email */}
          {step === 1 && (
            <>
              <Text style={styles.label}>
                Masukkan email untuk menerima kode verifikasi
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
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.tombol}
                  onPress={handleSendCode}
                >
                  <Text style={styles.loginButtonText}>Kirim Kode</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* STEP 2: kode verifikasi */}
          {step === 2 && (
            <>
              <Text style={styles.label}>
                Masukkan kode verifikasi dari email Anda
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="key"
                  size={18}
                  color="gray"
                  style={styles.icon}
                />
                <TextInput
                  value={kode}
                  style={styles.inputtext}
                  placeholder="Masukkan Kode"
                  placeholderTextColor="gray"
                  onChangeText={setKode}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.tombol}
                  onPress={handleVerifyCode}
                >
                  <Text style={styles.loginButtonText}>Verifikasi</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* STEP 3: form lengkap */}
          {step === 3 && (
            <>
              <Text style={styles.label}>
                Lengkapi data untuk membuat akun baru
              </Text>

              {/* Nama */}
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person"
                  size={18}
                  color="gray"
                  style={styles.icon}
                />
                <TextInput
                  value={nama}
                  style={styles.inputtext}
                  placeholder="Masukkan Nama"
                  placeholderTextColor="gray"
                  onChangeText={setNama}
                  autoCapitalize="words"
                />
              </View>

              {/* Nomor HP */}
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call"
                  size={18}
                  color="gray"
                  style={styles.icon}
                />
                <TextInput
                  value={noHp}
                  style={styles.inputtext}
                  placeholder="Masukkan Nomor HP"
                  placeholderTextColor="gray"
                  onChangeText={setNoHp}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Password */}
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

              {/* Konfirmasi Password */}
              <View style={styles.inputWrapper}>
                <FontAwesome6
                  name="lock"
                  size={21}
                  color="gray"
                  style={styles.iconPassword}
                />
                <TextInput
                  value={confirmPassword}
                  style={styles.inputtext}
                  placeholder="Konfirmasi Password"
                  placeholderTextColor="gray"
                  onChangeText={setConfirmPassword}
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

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.tombol} onPress={handleSignUp}>
                  <Text style={styles.loginButtonText}>Daftar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Tombol Ke Login */}
          <View style={styles.buttonContainerSignUp}>
            <TouchableOpacity
              style={styles.tombolSignUp}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Kembali ke Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    width: 180,
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
    fontSize: 36,
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
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 40,
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
});

export default SignUp;
