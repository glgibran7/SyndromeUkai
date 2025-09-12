import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
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

const MateriListScreen = ({ route, navigation }) => {
  const { id_modul } = route.params;
  const [materiList, setMateriList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [user, setUser] = useState({ name: 'Peserta', role: 'peserta' });
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Tambah Materi ---
  const [addModal, setAddModal] = useState(false);
  const [judul, setJudul] = useState('');
  const [urlFile, setUrlFile] = useState('');
  const [tipeMateri, setTipeMateri] = useState('document');
  const [viewerOnly, setViewerOnly] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  // === Fetch Materi ===
  const fetchMateri = async (role, modulId) => {
    try {
      setLoading(true);
      const endpoint = role === 'mentor' ? '/materi/mentor' : '/materi/peserta';
      const res = await Api.get(endpoint);

      if (res.data.status === 'success') {
        const filtered = res.data.data.filter(
          m => m.id_modul === modulId && m.tipe_materi === 'document',
        );
        setMateriList(filtered);
        setFilteredList(filtered);
      }
    } catch (error) {
      console.error('Gagal mengambil data materi:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          name: parsedUser.nama || 'Peserta',
          role: parsedUser.role || 'peserta',
        });
        fetchMateri(parsedUser.role || 'peserta', id_modul);
      } else {
        fetchMateri('peserta', id_modul);
      }
    } catch (error) {
      console.error('Gagal mengambil data user:', error);
      fetchMateri('peserta', id_modul);
    }
  };

  useEffect(() => {
    getUserData();
  }, [id_modul]);

  // Search & filter
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

  // Swipe to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMateri(user.role, id_modul);
  }, [user.role, id_modul]);

  // === Submit Materi ===
  const handleAddMateri = async () => {
    if (!judul || !urlFile) {
      Alert.alert('Error', 'Judul dan URL wajib diisi');
      return;
    }
    try {
      setAddLoading(true);
      const payload = {
        id_modul,
        tipe_materi: 'document', // 🔒 fix document saja
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
      fetchMateri(user.role, id_modul);
    } catch (err) {
      console.error('Gagal tambah materi:', err.response?.data || err.message);
      Alert.alert('Error', 'Gagal menambah materi');
    } finally {
      setAddLoading(false);
    }
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
        <ScrollView
          style={{ flex: 1 }}
          stickyHeaderIndices={[0]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <Header navigation={navigation} showBack={true} />

          {/* Title & Search */}
          <View style={styles.greetingBox}>
            <Text style={styles.sectionTitle}>
              Materi ({user.role === 'mentor' ? 'Mentor' : 'Peserta'})
            </Text>
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

          {/* Main Content */}
          <View style={styles.mainContent}>
            {loading ? (
              <ActivityIndicator size="large" color="#9D2828" />
            ) : (
              <>
                {/* Filter + Tambah Materi */}
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
                      Baru Dibaca
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
                        + Tambah Materi
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* List Card */}
                <View style={styles.menuGrid}>
                  {filteredList.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#555' }}>
                      Tidak ada materi tersedia
                    </Text>
                  ) : (
                    filteredList.map(item => (
                      <TouchableOpacity
                        key={item.id_materi}
                        activeOpacity={0.8}
                        onPress={() =>
                          navigation.navigate('MateriViewer', {
                            url: item.url_file,
                            title: item.judul,
                          })
                        }
                      >
                        <LinearGradient
                          colors={['#B71C1C', '#7B0D0D']}
                          style={styles.menuItem}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <Ionicons
                              name="document-text-outline"
                              size={28}
                              color="#fff"
                              style={{ marginRight: 10 }}
                            />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.menuTitle}>{item.judul}</Text>
                              <Text style={styles.menuDesc}>
                                {item.tipe_materi}
                              </Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Modal Tambah Materi */}
        <Modal
          visible={addModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Tambah Materi</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Judul"
                value={judul}
                onChangeText={setJudul}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="URL File"
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
  );
};

const styles = StyleSheet.create({
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
  menuGrid: { flexDirection: 'column', gap: 10 },
  menuItem: { borderRadius: 15, padding: 15 },
  menuTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    textTransform: 'capitalize',
  },
  menuDesc: {
    fontSize: 12,
    color: '#fff',
    marginTop: 2,
    textTransform: 'capitalize',
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

export default MateriListScreen;
