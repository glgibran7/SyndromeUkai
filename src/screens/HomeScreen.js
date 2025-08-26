import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FlatList } from 'react-native';
import MentorList from '../components/MentorList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/Api';

const { width } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % MentorList.length;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

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

    getUserData();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // panggil API logout
      await Api.post('/auth/logout');

      // hapus data user di AsyncStorage
      await AsyncStorage.removeItem('user');

      // redirect ke halaman login
      navigation.replace('Login');
    } catch (error) {
      console.error('Gagal logout:', error);
      alert('Logout gagal, coba lagi.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menus = [
    {
      title: 'Materi',
      desc: 'Kumpulan Materi',
      icon: require('../../src/img/icon_folder.png'),
      backgroundColor: '#FFF8E3',
      wave: require('../../src/img/wave2.png'),
      to: 'Materi',
    },
    {
      title: 'Video',
      desc: 'Kumpulan Materi Video',
      icon: require('../../src/img/icon_video.png'),
      backgroundColor: '#FFF8E3',
      wave: require('../../src/img/wave3.png'),
      to: 'Video',
    },
    {
      title: 'TryOut',
      desc: 'Kumpulan soal-soal',
      icon: require('../../src/img/icon_file.png'),
      backgroundColor: '#FFF8F8',
      wave: require('../../src/img/wave1.png'),
      to: 'TryOut',
    },
    {
      title: 'Hasil Try Out',
      desc: 'Kumpulan Hasil Try Out',
      icon: require('../../src/img/icon_pesan.png'),
      backgroundColor: '#FFEAEA',
      wave: require('../../src/img/wave4.png'),
      to: 'Hasil',
    },
  ];

  return (
    <LinearGradient
      colors={['#9D2828', '#191919']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#a10505" />
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Image
              source={require('../../src/img/logo_putih.png')}
              style={styles.logo}
            />
          </View>

          <View style={styles.userInfo}>
            {/* Avatar */}
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
              <View style={styles.avatarInitial}>
                <Text style={styles.avatarText}>
                  {user.name.split(' ')[0][0]}
                </Text>
              </View>
            </TouchableOpacity>

            {menuVisible && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate('Profile');
                  }}
                >
                  <Text style={styles.dropdownText}>Profil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <ActivityIndicator size="small" color="#700101" />
                      <Text
                        style={[
                          styles.dropdownText,
                          { marginLeft: 8, color: 'gray' },
                        ]}
                      >
                        Logging out...
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.dropdownText}>Logout</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greetingBox}>
          <Text style={styles.greeting}>Hi, {user.name}</Text>
          <Text style={styles.subtext}>
            Platform penyedia layanan pendidikan farmasi{'\n'}
            <Text style={{ fontWeight: 'bold' }}>terbaik dan ter-murah</Text>
          </Text>
        </View>

        {/* Content */}
        <View style={styles.mainContent}>
          {/* Menu */}
          <Text style={styles.sectionTitle}>Daftar Menu</Text>
          <View style={styles.menuGrid}>
            {menus.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  { backgroundColor: item.backgroundColor },
                ]}
                onPress={() => navigation.navigate(item.to)}
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

          {/* Mentor */}
          <Text style={styles.sectionTitle}>Daftar Mentor</Text>
          <FlatList
            ref={flatListRef}
            data={MentorList}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={{ marginRight: 15 }}>
                <Image
                  source={item.image}
                  style={{
                    width: width * 0.4,
                    height: width * 0.5,
                    resizeMode: 'contain',
                  }}
                />
              </View>
            )}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 20,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    resizeMode: 'contain',
  },
  userInfo: {
    position: 'relative',
  },
  avatarInitial: {
    width: 35,
    height: 35,
    borderRadius: 999,
    backgroundColor: '#0b62e4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 999,
    width: 160, // Lebar dropdown
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    fontSize: 15,
    color: '#000',
  },
  greetingBox: {
    marginTop: -5,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  subtext: {
    fontSize: 13,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  mainContent: {
    backgroundColor: 'white',
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginTop: 30,
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
  },
  menuDesc: {
    fontSize: 13,
    color: '#555',
    marginTop: 5,
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

export default Home;
