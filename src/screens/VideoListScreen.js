import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  TextInput,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/Api';
import Ionicons from '@react-native-vector-icons/ionicons';

const { height, width } = Dimensions.get('window');

const getDirectGoogleDriveLink = url => {
  const match = url.match(/\/d\/(.+?)\//);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return url;
};

const VideoListScreen = ({ route, navigation }) => {
  const { id_modul } = route.params;
  const [materiList, setMateriList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [user, setUser] = useState({ name: 'Peserta', paket: 'Premium' });

  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

    const getMateri = async () => {
      try {
        const res = await Api.get('/materi/peserta');
        if (res.data.status === 'success') {
          const filtered = res.data.data.filter(
            m => m.id_modul === id_modul && m.tipe_materi === 'video',
          );
          setMateriList(filtered);
          setFilteredList(filtered);
        }
      } catch (error) {
        console.error('Gagal mengambil data materi:', error);
      }
    };

    getUserData();
    getMateri();
  }, [id_modul]);

  useEffect(() => {
    let data = materiList;
    if (searchQuery) {
      data = data.filter(item =>
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (filterType === 'Baru') {
      data = data.filter(item => !item.viewer_only);
    }
    setFilteredList(data);
  }, [searchQuery, filterType, materiList]);

  const handleScroll = event => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 100) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <LinearGradient colors={['#9D2828', '#191919']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#a10505" />
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Image
            source={require('../../src/img/logo_putih.png')}
            style={styles.logo}
          />
          <View style={styles.userInfo}>
            <View style={styles.paketBadge}>
              <Text style={styles.paketText}>🥇 {user.paket}</Text>
            </View>
            <View style={styles.avatarInitial}>
              <Text style={styles.avatarText}>
                {user.name.split(' ')[0][0]}
              </Text>
            </View>
          </View>
        </View>

        {/* Title & Search */}
        <View style={styles.greetingBox}>
          <Text style={styles.sectionTitle}>Video</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#fff"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search-outline" size={18} color="#fff" />
          </View>
        </View>

        {/* Filter */}
        <View style={styles.mainContent}>
          <View style={styles.filterContainer}>
            <Text style={styles.sectionTitle2}>Daftar Materi</Text>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'Semua' && styles.filterActive,
              ]}
              onPress={() => setFilterType('Semua')}
            >
              <Text
                style={[
                  styles.filterText,
                  filterType === 'Semua' && styles.filterTextActive,
                ]}
              >
                Semua
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'Baru' && styles.filterActive,
              ]}
              onPress={() => setFilterType('Baru')}
            >
              <Text
                style={[
                  styles.filterText,
                  filterType === 'Baru' && styles.filterTextActive,
                ]}
              >
                Baru di Tonton
              </Text>
            </TouchableOpacity>
          </View>

          {/* Video List */}
          <View style={styles.videoList}>
            {filteredList.map(item => (
              <TouchableOpacity
                key={item.id_materi}
                onPress={() =>
                  navigation.navigate('VideoViewer', {
                    id_materi: item.id_materi,
                    title: item.judul,
                    url_file: item.url_file,
                    channel: 'UKAI',
                    views: '90K',
                    time: '1 months ago',
                    avatar: 'https://via.placeholder.com/50',
                  })
                }
              >
                <View style={styles.thumbnailWrapper}>
                  <Image
                    source={{
                      uri: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                    }} // bisa diganti thumbnail asli
                    style={styles.thumbnail}
                  />
                </View>
                <View style={styles.videoInfoRow}>
                  <Image
                    source={{ uri: 'https://via.placeholder.com/50' }}
                    style={styles.channelAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {item.judul}
                    </Text>
                    <Text style={styles.videoMeta}>
                      UKAI • 90K views • 1 months ago
                    </Text>
                  </View>
                  <Ionicons name="ellipsis-vertical" size={18} color="#555" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Scroll to Top */}
      <Animated.View style={[styles.scrollTopBtn, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={scrollToTop}>
          <Ionicons name="arrow-up" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    resizeMode: 'contain',
    marginLeft: -80,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  paketBadge: {
    backgroundColor: '#feb600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  paketText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  greetingBox: { marginTop: -5, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0b1',
    borderRadius: 15,
    paddingHorizontal: 10,
  },
  searchInput: { flex: 1, height: 40, color: '#000' },
  mainContent: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 30,
    minHeight: height - 200,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  filterText: { color: '#000000ff', fontSize: 12 },
  filterActive: { backgroundColor: '#000000ff' },
  filterTextActive: { color: '#fff' },
  videoList: { flexDirection: 'column', gap: 20 },
  thumbnailWrapper: { position: 'relative' },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  videoInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    gap: 8,
  },
  channelAvatar: {
    width: 35,
    height: 35,
    borderRadius: 50,
    backgroundColor: '#ddd',
  },
  videoTitle: { fontSize: 15, fontWeight: '600', color: '#000' },
  videoMeta: { fontSize: 12, color: '#555', marginTop: 2 },
  scrollTopBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 50,
    elevation: 5,
  },
});

export default VideoListScreen;
