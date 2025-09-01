import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';

const ForgotPassword = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FF8DA1' }}>
      <View style={styles.container}>
        {/* Tombol Back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Image source={require('../img/img_login.png')} style={styles.image} />
        <Text style={styles.title}>Sedang Dalam Pengembangan</Text>
        <Text style={styles.subtitle}>
          Fitur lupa password akan segera hadir di update berikutnya
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF8DA1',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20, // ujung kanan
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3, // biar ada shadow di Android
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#700101',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ForgotPassword;
