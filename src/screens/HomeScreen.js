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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FlatList } from 'react-native';
import MentorList from '../components/MentorList';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % MentorList.length;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, 3000); // setiap 3 detik

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
            paket: 'Premium', // atau bisa diambil dari backend jika tersedia
          });
        }
      } catch (error) {
        console.error('Gagal mengambil data user:', error);
      }
    };

    getUserData();
  }, []);

  const menus = [
    {
      title: 'TryOut',
      desc: 'Kumpulan soal-soal',
      icon: require('../../src/img/icon_file.png'),
      backgroundColor: '#FFF8F8',
      wave: require('../../src/img/wave1.png'),
      to: 'TryOut',
    },
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
      title: 'Hasil Try Out',
      desc: 'Kumpulan Hasil Try Out',
      icon: require('../../src/img/icon_pesan.png'),
      backgroundColor: '#FFEAEA',
      wave: require('../../src/img/wave4.png'),
      to: 'HasilTryOut',
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
            <View style={styles.paketBadge}>
              <Text style={styles.paketText}>🥇 {user.paket}</Text>
            </View>
            <View style={styles.avatarInitial}>
              <Text style={styles.avatarText}>
                {user.name.split(' ')[0][0]}
                {/* {user.name.split(' ')[1]?.[0]} */}
              </Text>
            </View>
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

                {/* Icon di atas wave */}
                <View style={styles.menuIconContainer}>
                  <Image source={item.icon} style={styles.menuIcon} />
                </View>

                {/* Wave PNG di bagian bawah card */}
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
    flexDirection: 'row', // sejajar horizontal
    alignItems: 'center',
    gap: 8, // jarak antara avatar dan badge
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

  avatar: {
    width: 35,
    height: 35,
    borderRadius: 999,
    marginBottom: 4,
  },
  paketBadge: {
    backgroundColor: '#feb600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  paketText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
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
    overflow: 'hidden', // agar wave tidak keluar dari card
    position: 'relative', // penting agar wave absolute mengacu ke card
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
    height: 80, // atur sesuai ukuran wave.png
    resizeMode: 'cover',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    zIndex: -1, // pastikan wave berada di belakang konten card
  },
});

export default Home;
