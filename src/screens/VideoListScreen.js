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
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/Api';
import Ionicons from '@react-native-vector-icons/ionicons';
import Header from '../components/Header';

const { height, width } = Dimensions.get('window');

const Avatar = ({ size = 35, initial = 'U' }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: '#0b62e4',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
      {initial}
    </Text>
  </View>
);

const VideoListScreen = ({ route, navigation }) => {
  const { id_modul } = route.params;
  const [materiList, setMateriList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [user, setUser] = useState({ name: 'Peserta', paket: 'Premium' });
  const [dropdownVisible, setDropdownVisible] = useState(false);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9D2828' }}>
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
          {' '}
          <ScrollView
            ref={scrollRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingBottom: 50 }}
            stickyHeaderIndices={[0]} // sticky wrapper di index 0
          >
            {/* Sticky Header + Search */}
            <View style={styles.stickyHeaderWrapper}>
              <LinearGradient
                colors={['#9D2828', '#191919']} // Sesuaikan warna gradient di sini
                style={{ flex: 1, paddingBottom: 10 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {/* Header */}
                <Header navigation={navigation} showBack={true} />
                {/* Search Bar */}
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
              </LinearGradient>
            </View>

            {/* Filter */}
            <View style={styles.mainContent}>
              <View style={styles.filterContainer}>
                <Text style={styles.sectionTitle2}>Daftar Video</Text>
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
                        channel: 'UKAI SYNDROME',
                      })
                    }
                  >
                    <View style={styles.thumbnailWrapper}>
                      <Image
                        source={require('../img/logo_putih.png')}
                        style={styles.thumbnail}
                      />
                    </View>
                    <View style={styles.videoInfoRow}>
                      <Avatar size={35} initial="U" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.videoTitle} numberOfLines={2}>
                          {item.judul}
                        </Text>
                        <Text style={styles.videoMeta}>
                          UKAI SYNDROME {'  '}
                        </Text>
                      </View>
                      <Ionicons
                        name="ellipsis-vertical"
                        size={18}
                        color="#555"
                      />
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
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  stickyHeaderWrapper: {
    zIndex: 100,
  },

  greetingBox: { paddingHorizontal: 20 },
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
    height: '100%',
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
    resizeMode: 'contain',
    borderRadius: 8,
    backgroundColor: '#9D2828',
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
  videoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    textTransform: 'capitalize',
  },
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
