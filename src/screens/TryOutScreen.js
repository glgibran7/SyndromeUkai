import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import Api from '../utils/Api'; // sesuaikan path

const { height, width } = Dimensions.get('window');

const TryoutScreen = ({ navigation }) => {
  const [tryoutList, setTryoutList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [user, setUser] = useState({
    name: 'Peserta',
    paket: 'Premium',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTryout, setSelectedTryout] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

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
    fetchTryouts();
  }, []);

  const fetchTryouts = async () => {
    try {
      setIsLoading(true);
      const response = await Api.get('/tryout/list');
      const list = response.data.data || [];

      // Filter only visible tryouts
      const openTryouts = list.filter(to => to.visibility === 'open');

      // Fetch remaining attempts per tryout
      const updatedList = await Promise.all(
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
            console.error('Error fetching remaining attempts:', err);
            return { ...to, remaining_attempts: null };
          }
        }),
      );

      setTryoutList(updatedList);
      setFilteredList(updatedList);
    } catch (error) {
      Alert.alert('Error', 'Gagal mengambil data tryout');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter & search
  useEffect(() => {
    let data = tryoutList;

    if (searchQuery) {
      data = data.filter(item =>
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterType === 'Farmasi') {
      data = data.filter(item => item.kategori === 'Farmasi');
    } else if (filterType === 'Simulasi') {
      data = data.filter(item => item.kategori === 'Simulasi');
    }

    setFilteredList(data);
  }, [searchQuery, filterType, tryoutList]);

  // Saat user pilih tryout, buka modal
  const handleTryoutPress = tryout => {
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

  const confirmStart = async () => {
    if (!selectedTryout) return;
    setIsStarting(true);
    try {
      // Start attempt
      const startRes = await Api.post(
        `/tryout/${selectedTryout.id_tryout}/attempts/start`,
      );

      const attemptData = startRes.data.data;

      // Setelah dapat attempt_token, fetch detail attempt pakai token
      const attemptDetail = await fetchAttemptByToken(
        selectedTryout.id_tryout,
        attemptData.attempt_token,
      );

      setModalVisible(false);
      setIsStarting(false);

      navigation.navigate('ExamScreen', {
        tryout: selectedTryout,
        attempt: attemptDetail, // pake data lengkap dari token
      });
    } catch (error) {
      setIsStarting(false);
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Gagal memulai tryout. Silakan coba lagi.',
      );
    }
  };

  return (
    <LinearGradient
      colors={['#9D2828', '#191919']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]}>
        <Header navigation={navigation} />

        <View style={styles.greetingBox}>
          <Text style={styles.sectionTitle}>Tryout (Beta Tester)</Text>
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

        <View style={styles.mainContent}>
          <View style={styles.filterContainer}>
            <Text style={styles.sectionTitle2}>Daftar Tryout</Text>

            {['Semua', 'Farmasi', 'Simulasi'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  filterType === type && styles.filterActive,
                ]}
                onPress={() => setFilterType(type)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filterType === type && styles.filterTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
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
                  disabled={item.remaining_attempts === 0} // disable kalau ga ada attempt
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
                          <Text style={styles.menuDesc}>
                            📝 {item.jumlah_soal} Soal
                          </Text>
                          <Text style={styles.menuDesc}>
                            ⏳ {item.durasi} Menit
                          </Text>
                        </View>
                        <View
                          style={{ flexDirection: 'row', marginTop: 6, gap: 8 }}
                        >
                          <Text style={styles.attemptInfo}>
                            Max Attempt: {item.max_attempt}
                          </Text>
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
          <View style={styles.modalContainer}>
            {selectedTryout && (
              <>
                <Text style={styles.modalTitle}>Mulai Tryout?</Text>
                <Text style={styles.modalTryoutTitle}>
                  {selectedTryout.judul}
                </Text>
                <Text style={styles.modalInfo}>
                  📝 Soal: {selectedTryout.jumlah_soal}
                </Text>
                <Text style={styles.modalInfo}>
                  ⏳ Durasi: {selectedTryout.durasi} Menit
                </Text>
                <Text style={styles.modalInfo}>
                  Sisa Attempt: {selectedTryout.remaining_attempts ?? '-'}
                </Text>

                {isStarting ? (
                  <ActivityIndicator
                    size="large"
                    color="#B71C1C"
                    style={{ marginTop: 15 }}
                  />
                ) : (
                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalButtonTextCancel}>Batal</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.startButton]}
                      onPress={confirmStart}
                    >
                      <Text style={styles.modalButtonTextStart}>Mulai</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  greetingBox: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  filterText: {
    color: '#000000ff',
    fontSize: 12,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalTryoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInfo: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 15,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  startButton: {
    backgroundColor: '#B71C1C',
  },
  modalButtonTextCancel: {
    color: '#333',
    fontWeight: 'bold',
  },
  modalButtonTextStart: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TryoutScreen;
