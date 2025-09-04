import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/Api';
import Header from '../components/Header';

const { width, height } = Dimensions.get('window');

const VideoScreen = ({ navigation }) => {
  const [modulList, setmodulList] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [user, setUser] = useState({
    name: 'Peserta',
    paket: 'Premium',
  });

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            name: parsedUser.nama || 'Peserta',
            paket: 'Premium',
          });
        }
      } catch (error) {
        console.error('Gagal mengambil data user:', error);
      }
    };

    const getModul = async () => {
      try {
        const res = await Api.get('/modul/user');
        if (res.data.status === 'success') {
          const formatted = res.data.data.map((item, index) => ({
            id_modul: item.id_modul,
            title: item.judul,
            desc: item.deskripsi,
            icon: require('../../src/img/icon_folder.png'),
            backgroundColor: '#FFF8E3',
            wave: require(`../../src/img/wave1.png`),
          }));
          setmodulList(formatted);
        }
      } catch (error) {
        console.error('Gagal mengambil data modul:', error);
      }
    };

    getUserData();
    getModul();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (dropdownVisible) setDropdownVisible(false);
        Keyboard.dismiss();
      }}
    >
      <LinearGradient
        colors={['#9D2828', '#191919']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]}>
          {/* Header */}
          <Header navigation={navigation} style={styles.stickyHeaderWrapper} />

          {/* Title */}
          <View style={styles.greetingBox}>
            <Text style={styles.greeting}>Video</Text>
            <Text style={styles.subtext}>Kumpulan materi video lengkap</Text>
          </View>

          {/* Grid */}
          <View style={styles.mainContent}>
            <Text style={styles.sectionTitle}>Daftar Modul</Text>
            <View style={styles.menuGrid}>
              {modulList.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    { backgroundColor: item.backgroundColor },
                  ]}
                  onPress={() =>
                    navigation.navigate('VideoListScreen', {
                      id_modul: item.id_modul,
                    })
                  }
                >
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDesc}>{item.desc}</Text>
                  <View style={styles.menuIconContainer}>
                    <Image source={item.icon} style={styles.menuIcon} />
                  </View>
                  <Image source={item.wave} style={styles.waveImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  stickyHeaderWrapper: {
    zIndex: 100,
  },

  greetingBox: {
    paddingHorizontal: 15,
  },
  greeting: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtext: {
    fontSize: 13,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  mainContent: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 30,
    minHeight: height - 200,
    height: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: width * 0.42,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  menuTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#700101',
    textTransform: 'capitalize',
  },
  menuDesc: {
    fontSize: 10,
    color: '#555',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  menuIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  waveImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: 'auto',
    height: 80,
    resizeMode: 'cover',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    zIndex: -1,
  },
});

export default VideoScreen;
