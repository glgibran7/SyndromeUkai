import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <LinearGradient
      colors={['#ffffff', 'rgba(255,0,0,0.18)']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <StatusBar barStyle={'dark-content'} />

        {/* Gambar di atas */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../src/img/img_login.png')}
            style={styles.image}
          />
        </View>

        {/* Konten form login */}
        <View style={styles.content}>
          <Text style={styles.loginTitle}>SELAMAT DATANG</Text>
          <Text style={styles.label}>
            Platform penyedia layanan Pendidikan Farmasi berbasis teknologi
            terbaik dan termurah
          </Text>

          <TextInput
            value={email}
            style={styles.inputtext}
            placeholder="Masukkan Email"
            placeholderTextColor="gray"
            onChangeText={teks => setEmail(teks)}
          />

          <TextInput
            value={password}
            style={styles.inputtext}
            placeholder="Masukkan Password"
            placeholderTextColor="gray"
            onChangeText={teks => setPassword(teks)}
            secureTextEntry
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.tombol}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.loginButtonText}>Login</Text>
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
  inputtext: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 4,
    color: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 10,
    marginVertical: 10,
    fontSize: 14,
  },
  loginTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  label: {
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },

  imageContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  image: {
    width: width * 0.7, // 70% dari lebar layar
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
    marginTop: 20,
  },
});

export default Login;
