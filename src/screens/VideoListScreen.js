import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/Api';
import Ionicons from '@react-native-vector-icons/ionicons';
import Header from '../components/Header';

const { height } = Dimensions.get('window');

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
  const [user, setUser] = useState({ name: 'User', role: 'peserta' });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Tambah Video ---
  const [addModal, setAddModal] = useState(false);
  const [judul, setJudul] = useState('');
  const [urlFile, setUrlFile] = useState('');
  const [viewerOnly, setViewerOnly] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          name: parsedUser.nama || 'User',
          role: parsedUser.role || 'peserta',
        });
        return parsedUser.role || 'peserta';
      }
    } catch (error) {
      console.error('Gagal mengambil data user:', error);
    }
    return 'peserta';
  };

  const getMateri = async role => {
    try {
      setLoading(true);
      const endpoint = role === 'mentor' ? '/materi/mentor' : '/materi/peserta';
      const res = await Api.get(endpoint);
      console.log('Endpoint dipakai:', endpoint);

      if (res.data.status === 'success') {
        const filtered = res.data.data.filter(
          m => m.id_modul === id_modul && m.tipe_materi === 'video',
        );
        setMateriList(filtered);
        setFilteredList(filtered);
      } else {
        setMateriList([]);
        setFilteredList([]);
      }
    } catch (error) {
      console.error('Gagal mengambil data materi:', error);
      setMateriList([]);
      setFilteredList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // ambil user dulu lalu fetch materi sesuai role
    (async () => {
      const role = await getUserData();
      await getMateri(role);
    })();
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

  const onRefresh = () => {
    setRefreshing(true);
    getMateri(user.role);
  };

  // === Submit Video ===
  const handleAddMateri = async () => {
    if (!judul || !urlFile) {
      Alert.alert('Error', 'Judul dan URL wajib diisi');
      return;
    }
    try {
      setAddLoading(true);
      const payload = {
        id_modul,
        tipe_materi: 'video',
        judul,
        url_file: urlFile,
        visibility: 'open',
        viewer_only: viewerOnly,
      };
      await Api.post('/materi/mentor', payload);
      setAddModal(false);
      setJudul('');
      setUrlFile('');
      setViewerOnly(false);
      // refresh list
      getMateri(user.role);
    } catch (err) {
      console.error('Gagal tambah materi:', err.response?.data || err.message);
      Alert.alert('Error', 'Gagal menambah materi');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9D2828' }}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <LinearGradient
          colors={['#9D2828', '#191919']}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={{ color: '#fff', marginTop: 10 }}>Loading...</Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingBottom: 50 }}
              stickyHeaderIndices={[0]}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {/* Sticky Header + Search */}
              <View style={styles.stickyHeaderWrapper}>
                <LinearGradient
                  colors={['#9D2828', '#191919']}
                  style={{ flex: 1, paddingBottom: 10 }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Header navigation={navigation} showBack={true} />
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

                  {user.role === 'mentor' && (
                    <TouchableOpacity
                      style={[
                        styles.filterButton,
                        { backgroundColor: 'green' },
                      ]}
                      onPress={() => setAddModal(true)}
                    >
                      <Text style={{ color: '#fff', fontSize: 12 }}>
                        + Tambah Video
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Video List */}
                <View style={styles.videoList}>
                  {filteredList.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                      <Text style={{ color: '#555' }}>
                        Tidak ada materi tersedia
                      </Text>
                    </View>
                  ) : (
                    filteredList.map(item => (
                      <TouchableOpacity
                        key={item.id_materi}
                        onPress={() =>
                          navigation.navigate('VideoViewer', {
                            id_materi: item.id_materi,
                            title: item.judul,
                            url_file: item.url_file,
                            channel: item.user?.nama || user.name,
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
                            <Text style={styles.videoMeta}>UKAI SYNDROME</Text>
                          </View>
                          <Ionicons
                            name="ellipsis-vertical"
                            size={18}
                            color="#555"
                          />
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>
            </ScrollView>
          )}

          {/* Scroll to Top */}
          <Animated.View style={[styles.scrollTopBtn, { opacity: fadeAnim }]}>
            <TouchableOpacity onPress={scrollToTop}>
              <Ionicons name="arrow-up" size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          {/* Modal Tambah Video */}
          <Modal
            visible={addModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setAddModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Tambah Video</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Judul"
                  value={judul}
                  onChangeText={setJudul}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="URL File (video)"
                  value={urlFile}
                  onChangeText={setUrlFile}
                />
                <TouchableOpacity
                  onPress={() => setViewerOnly(!viewerOnly)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 15,
                  }}
                >
                  <Ionicons
                    name={viewerOnly ? 'checkbox' : 'square-outline'}
                    size={20}
                    color="#000"
                    style={{ marginRight: 8 }}
                  />
                  <Text>Viewer Only</Text>
                </TouchableOpacity>

                <View
                  style={{ flexDirection: 'row', justifyContent: 'flex-end' }}
                >
                  <TouchableOpacity
                    onPress={() => setAddModal(false)}
                    style={[styles.filterButton, { marginRight: 10 }]}
                  >
                    <Text>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddMateri}
                    disabled={addLoading}
                    style={[
                      styles.filterButton,
                      {
                        backgroundColor: '#9D2828',
                        opacity: addLoading ? 0.7 : 1,
                      },
                    ]}
                  >
                    {addLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={{ color: '#fff' }}>Simpan</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  stickyHeaderWrapper: {
    zIndex: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexWrap: 'wrap',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});

export default VideoListScreen;
