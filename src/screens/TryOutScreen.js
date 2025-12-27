import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import Api from '../utils/Api'; // sesuaikan path
import ToastMessage from '../components/ToastMessage';
import { ThemeContext } from '../context/ThemeContext';

const { height, width } = Dimensions.get('window');

const TryoutScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [refreshing, setRefreshing] = useState(false);
  const [tryoutList, setTryoutList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState({
    name: 'Peserta',
    paket: 'Premium',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTryout, setSelectedTryout] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [filterTryoutModal, setFilterTryoutModal] = useState(false);
  const [selectedTryoutFilter, setSelectedTryoutFilter] = useState('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterType, setFilterType] = useState('Semua');
  const [tryoutFilterList, setTryoutFilterList] = useState([]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            name: parsedUser.nama || 'Peserta',
            paket: parsedUser.paket || 'Premium',
            role: parsedUser.role || 'peserta',
          });
        }
      } catch (error) {
        console.error('Gagal mengambil data user:', error);
      }
    };

    getUserData();
    fetchTryouts();
  }, []);

  const fetchTryouts = async () => {
    try {
      setIsLoading(true);

      // Ambil user role dulu
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      const response = await Api.get('/tryout/list');
      const list = response.data.data || [];

      // Hanya tampilkan visibility open
      const openTryouts = list.filter(to => to.visibility === 'open');

      let updatedList = [];

      if (parsedUser?.role === 'mentor') {
        // Hapus duplikat berdasarkan id_tryout
        updatedList = Array.from(
          new Map(openTryouts.map(item => [item.id_tryout, item])).values(),
        );
      } else {
        // Peserta → ambil remaining attempts
        updatedList = await Promise.all(
          openTryouts.map(async to => {
            try {
              const attemptRes = await Api.get(
                `/tryout/${to.id_tryout}/remaining-attempts`,
              );
              return {
                ...to,
                remaining_attempts: attemptRes.data.data.remaining_attempts,
              };
            } catch (err) {
              return { ...to, remaining_attempts: null };
            }
          }),
        );
      }

      setTryoutList(updatedList);
      setFilteredList(updatedList);

      // Buat filter dropdown unique
      const uniqueTryoutIds = [
        { id: 'Semua', title: 'Semua' },
        ...updatedList.map(i => ({
          id: i.id_tryout,
          title: i.judul,
        })),
      ];

      setTryoutFilterList(uniqueTryoutIds);
    } catch (error) {
      Alert.alert('Error', 'Gagal mengambil data tryout');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTryouts();
    } catch (e) {
      console.log('Refresh error:', e);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    let data = tryoutList;

    if (searchQuery) {
      data = data.filter(item =>
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterType !== 'Semua') {
      data = data.filter(item => item.id_tryout === filterType);
    }

    setFilteredList(data);
  }, [searchQuery, filterType, tryoutList]);

  // Saat user pilih tryout, buka modal
  const handleTryoutPress = tryout => {
    if (user.role === 'mentor') {
      return; // mentor tidak bisa membuka modal
    }
    setSelectedTryout(tryout);
    setModalVisible(true);
  };

  const fetchAttemptByToken = async (id_tryout, attempt_token) => {
    try {
      const response = await Api.get(
        `/tryout/${id_tryout}/attempts/${attempt_token}`,
      );
      return response.data.data;
    } catch (error) {
      console.error('Gagal mengambil attempt by token:', error);
      throw error;
    }
  };

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  // fungsi untuk tampilkan toast
  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // fungsi untuk sembunyikan toast
  const hideToast = () => {
    setToastVisible(false);
    setToastMessage('');
  };

  const confirmStart = async () => {
    if (!selectedTryout) return;
    setIsStarting(true);
    try {
      const startRes = await Api.post(
        `/tryout/${selectedTryout.id_tryout}/attempts/start`,
      );

      const statusCode = startRes.status;

      // Handle toast berdasarkan status code
      switch (statusCode) {
        case 200:
          showToast(
            'Melanjutkan attempt lama / attempt lama disubmit otomatis',
            'success',
          );
          break;
        case 201:
          showToast('Attempt baru dimulai', 'success');
          break;
        case 400:
          showToast('Gagal memulai attempt', 'error');
          break;
        case 404:
          showToast('Tryout tidak ditemukan', 'error');
          break;
        case 500:
          showToast('Internal server error', 'error');
          break;
        default:
          showToast(`Status tidak dikenal: ${statusCode}`, 'info');
          break;
      }

      const attemptData = startRes.data.data;

      const attemptDetail = await fetchAttemptByToken(
        selectedTryout.id_tryout,
        attemptData.attempt_token,
      );

      setModalVisible(false);
      setIsStarting(false);

      navigation.navigate('ExamScreen', {
        tryout: selectedTryout,
        attempt: attemptDetail,
      });
    } catch (error) {
      setIsStarting(false);

      const message =
        error.response?.data?.message ||
        'Gagal memulai tryout. Silakan coba lagi.';

      showToast(message, 'error');
    }
  };

  return (
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={['#B71C1C']}
          />
        }
      >
        <Header navigation={navigation} />

        <View style={styles.greetingBox}>
          <Text style={styles.sectionTitle}>Tryout</Text>
          <Text style={styles.subtext}>Tryout ukai untuk anda</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Tryout..."
              placeholderTextColor="#fff"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search-outline" size={18} color="#fff" />
          </View>
        </View>

        <View style={[styles.mainContent, { backgroundColor: theme.card }]}>
          <View style={styles.filterContainer}>
            <Text style={[styles.sectionTitle2, { color: theme.sectionTitle }]}>
              Daftar Tryout
            </Text>

            <TouchableOpacity
              style={[styles.filterButton, styles.filterActive]}
              onPress={() => setFilterModalVisible(true)}
            >
              <Text style={[styles.filterText, styles.filterTextActive]}>
                {filterType === 'Semua'
                  ? 'Semua'
                  : tryoutFilterList.find(f => f.id === filterType)?.title ||
                    filterType}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={{ marginTop: 40 }}>
              <ActivityIndicator size="large" color="#B71C1C" />
              <Text
                style={{ textAlign: 'center', marginTop: 10, color: '#000' }}
              >
                Memuat daftar tryout...
              </Text>
            </View>
          ) : filteredList.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#000' }}>
              Tidak ada tryout tersedia.
            </Text>
          ) : (
            <View style={styles.menuGrid}>
              {filteredList.map(item => (
                <TouchableOpacity
                  key={item.id_tryout}
                  activeOpacity={0.8}
                  onPress={() => handleTryoutPress(item)}
                  disabled={
                    item.remaining_attempts === 0 || user.role === 'mentor'
                  } // disable kalau ga ada attempt
                >
                  <LinearGradient
                    colors={
                      item.remaining_attempts === 0
                        ? ['#666', '#444']
                        : ['#B71C1C', '#7B0D0D']
                    }
                    style={styles.menuItem}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={28}
                        color="#fff"
                        style={{ marginRight: 12 }}
                      />

                      <View style={{ flex: 1 }}>
                        <Text style={styles.menuTitle}>{item.judul}</Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 10,
                            marginTop: 4,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Ionicons
                              name="document-text-outline"
                              size={14}
                              color="#fff"
                            />
                            <Text style={styles.menuDesc}>
                              {item.jumlah_soal} Soal
                            </Text>
                          </View>

                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Ionicons
                              name="time-outline"
                              size={14}
                              color="#fff"
                            />
                            <Text style={styles.menuDesc}>
                              Durasi: {item.durasi} Menit
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{ flexDirection: 'row', marginTop: 6, gap: 8 }}
                        >
                          {/* Max attempt tetap ada untuk semua role */}
                          <Text style={styles.attemptInfo}>
                            Max Attempt: {item.max_attempt}
                          </Text>

                          {/* Jika peserta → tampilkan sisa attempt */}
                          {user.role !== 'mentor' && (
                            <Text
                              style={[
                                styles.attemptInfo,
                                item.remaining_attempts === 0
                                  ? styles.attemptZero
                                  : styles.attemptAvailable,
                              ]}
                            >
                              Sisa: {item.remaining_attempts ?? '-'}
                            </Text>
                          )}

                          {/* Jika mentor → ganti menjadi visibility */}
                          {user.role === 'mentor' && (
                            <Text
                              style={[
                                styles.attemptInfo,
                                {
                                  backgroundColor: '#e3f2fd',
                                  color: '#0d47a1',
                                },
                              ]}
                            >
                              Visibility: {item.visibility}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ToastMessage
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={hideToast}
        position="top"
      />

      {/* Modal konfirmasi start tryout */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isStarting) setModalVisible(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="alert-circle-outline" size={45} color="#B71C1C" />
            </View>

            <Text style={styles.modalTitle}>Konfirmasi</Text>

            {selectedTryout && (
              <>
                <Text style={styles.modalSubtitle}>
                  Mulai Tryout:{' '}
                  <Text style={{ fontWeight: 'bold' }}>
                    {selectedTryout.judul}
                  </Text>{' '}
                  ?
                </Text>

                <View style={styles.detailBox}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 5,
                    }}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color="#444"
                    />
                    <Text style={styles.modalInfo}>
                      {selectedTryout.jumlah_soal} Soal
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 5,
                    }}
                  >
                    <Ionicons name="time-outline" size={18} color="#444" />
                    <Text style={styles.modalInfo}>
                      Durasi: {selectedTryout.durasi} Menit
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Ionicons
                      name="checkmark-done-outline"
                      size={18}
                      color="#444"
                    />
                    <Text style={styles.modalInfo}>
                      Attempt Tersisa:{' '}
                      {selectedTryout.remaining_attempts ?? '-'}
                    </Text>
                  </View>
                </View>

                {isStarting ? (
                  <ActivityIndicator
                    size="large"
                    color="#B71C1C"
                    style={{ marginTop: 15 }}
                  />
                ) : (
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.btnOutline}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.textOutline}>Batal</Text>
                    </TouchableOpacity>

                    <LinearGradient
                      colors={['#B71C1C', '#7B0D0D']}
                      style={styles.btnStart}
                    >
                      <TouchableOpacity onPress={confirmStart}>
                        <Text style={styles.textStart}>Mulai</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPressOut={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tryout</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {tryoutFilterList.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.modalItem,
                  filterType === item.id && styles.modalItemSelected,
                ]}
                onPress={() => {
                  setFilterType(item.id);
                  setFilterModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    filterType === item.id && styles.modalItemTextSelected,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  greetingBox: {
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  subtext: { fontSize: 13, color: '#fff', marginTop: 5, textAlign: 'center' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0b1',
    borderRadius: 15,
    paddingHorizontal: 10,
    marginTop: 15,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#000',
  },
  mainContent: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 30,
    minHeight: height - 200,
    height: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
    flexWrap: 'wrap',
  },
  sectionTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000000ff',
    marginRight: 8,
    minWidth: 90,
  },
  filterText: {
    color: '#000000ff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },
  filterActive: {
    backgroundColor: '#000000ff',
  },
  filterTextActive: {
    color: '#fff',
  },
  menuGrid: {
    flexDirection: 'column',
    gap: 10,
  },
  menuItem: {
    borderRadius: 15,
    padding: 15,
  },
  menuTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    textTransform: 'capitalize',
  },
  menuDesc: {
    fontSize: 12,
    color: '#fff',
  },
  attemptInfo: {
    fontSize: 12,
    color: '#333',
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 15,
  },
  attemptZero: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  attemptAvailable: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  modalCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    transform: [{ translateY: -10 }],
  },

  iconCircle: {
    width: 65,
    height: 65,
    backgroundColor: '#FDECEA',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginBottom: 8,
  },

  modalSubtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },

  detailBox: {
    width: '100%',
    backgroundColor: '#fafafa',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  modalInfo: {
    fontSize: 14,
    marginBottom: 5,
    color: '#444',
  },

  btnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },

  btnOutline: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#B71C1C',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  textOutline: {
    color: '#B71C1C',
    fontWeight: 'bold',
    fontSize: 15,
  },

  btnStart: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  textStart: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    maxHeight: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9D2828',
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: '#F7F7F7',
  },
  modalItemSelected: {
    backgroundColor: '#9D2828',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TryoutScreen;
