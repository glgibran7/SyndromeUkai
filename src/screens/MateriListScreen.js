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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Linking } from 'react-native';

const { height } = Dimensions.get('window');

const MateriListScreen = ({ route, navigation }) => {
  const { id_modul } = route.params;
  const [materiList, setMateriList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [user, setUser] = useState({ name: 'Peserta', role: 'peserta' });
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Tambah Materi ---
  const [addModal, setAddModal] = useState(false);
  const [judul, setJudul] = useState('');
  const [urlFile, setUrlFile] = useState('');
  const [tipeMateri, setTipeMateri] = useState('document');
  const [isDownloadable, setIsDownloadable] = useState(0);
  const [addLoading, setAddLoading] = useState(false);

  // === Fetch Materi ===
  const fetchMateri = async (role, modulId) => {
    try {
      setLoading(true);
      const endpoint =
        role === 'mentor' ? '/materi/mentor' : '/materi/mobile/peserta';
      const res = await Api.get(endpoint);

      if (res.data.status === 'success') {
        const filtered = res.data.data.filter(
          m => m.id_modul === modulId && m.tipe_materi === 'document',
        );
        setMateriList(
          filtered.filter(
            (v, i, a) => a.findIndex(t => t.id_materi === v.id_materi) === i,
          ),
        );
        setFilteredList(filtered);
      }
    } catch (error) {
      console.error('Gagal mengambil data materi:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchNamaModul = async () => {
    try {
      const res = await Api.get(`/modul/${id_modul}`);
      if (res.data?.data?.nama_modul) {
        setNamaModul(res.data.data.nama_modul);
      }
    } catch (err) {
      console.log('Gagal ambil nama modul:', err);
    }
  };

  const getUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          name: parsedUser.name || parsedUser.nama || 'Mentor' || 'Peserta',
          role: parsedUser.role || 'Peserta',
        });

        fetchMateri(parsedUser.role || 'Peserta', id_modul);
      } else {
        fetchMateri('Peserta', id_modul);
      }
    } catch (error) {
      console.error('Gagal mengambil data user:', error);
      fetchMateri('Peserta', id_modul);
    }
  };

  useEffect(() => {
    fetchNamaModul();
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
      data = data.filter(item => !item.isDownloadable);
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
        is_downloadable: isDownloadable,
      };
      await Api.post('/materi/mentor', payload);
      setAddModal(false);
      setJudul('');
      setUrlFile('');
      setIsDownloadable(false);
      fetchMateri(user.role, id_modul);
    } catch (err) {
      console.error('Gagal tambah materi:', err.response?.data || err.message);
      Alert.alert('Error', 'Gagal menambah materi');
    } finally {
      setAddLoading(false);
    }
  };

  // Auto generate judul
  const [tanggalMateri, setTanggalMateri] = useState(new Date());
  const [nickname, setNickname] = useState('');
  const [namaModul, setNamaModul] = useState('');

  const formatTanggal = date => {
    const bulan = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${date.getDate()} ${bulan[date.getMonth()]} ${date
      .getFullYear()
      .toString()
      .slice(-2)}`;
  };

  const generateJudulMateri = () => {
    const date = tanggalMateri || new Date();

    const bulan = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];

    const formattedDate = `${String(date.getDate()).padStart(2, '0')} ${
      bulan[date.getMonth()]
    } ${String(date.getFullYear()).slice(-2)}`;

    const firstName = user?.name?.trim()?.split(' ')[0] || 'Mentor';
    const moduleName = namaModul || route.params?.nama_modul || 'Modul';

    return `${formattedDate}_Kak ${firstName}_${moduleName}`.replace(
      /_+/g,
      '_',
    );
  };

  // Load nickname & modul name
  useEffect(() => {
    if (addModal) {
      setJudul(generateJudulMateri());
    }
  }, [tanggalMateri, namaModul, user]);

  const updateDownloadableStatus = async (id_materi, statusSekarang) => {
    try {
      const newStatus = statusSekarang ? 0 : 1;

      await Api.put(`/materi/${id_materi}/downloadable`, {
        is_downloadable: newStatus,
      });

      fetchMateri(user.role, id_modul);
    } catch (err) {
      console.log(err);
      Alert.alert('Gagal', 'Tidak dapat mengubah status downloadable');
    }
  };

  const getDirectDownloadUrl = url => {
    try {
      const fileId = url.match(/\/d\/(.*?)\//)[1];
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    } catch {
      return url;
    }
  };

  const handleDownload = item => {
    const downloadUrl = getDirectDownloadUrl(item.url_file);
    Linking.openURL(downloadUrl);
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
            <Text style={styles.sectionTitle}>Materi</Text>
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

                  {/* <TouchableOpacity
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
                  </TouchableOpacity> */}

                  {user.role === 'mentor' && (
                    <TouchableOpacity
                      style={[
                        styles.filterButton,
                        { backgroundColor: 'green' },
                      ]}
                      onPress={() => {
                        setNamaModul(route.params?.nama_modul || namaModul);
                        setAddModal(true);

                        setTimeout(() => {
                          setJudul(generateJudulMateri());
                        }, 200);
                      }}
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
                    filteredList.map((item, index) => (
                      <TouchableOpacity
                        key={`${item.id_materi}-${index}`}
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

                              {/* Subinfo */}
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  marginTop: 4,
                                }}
                              >
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginTop: 4,
                                  }}
                                >
                                  <Text style={styles.menuDesc}>
                                    {item.tipe_materi}
                                  </Text>

                                  {/* Badge clickable */}
                                  {user.role === 'mentor' ? (
                                    // Mentor tetap bisa toggle status download
                                    <TouchableOpacity
                                      onPress={() =>
                                        updateDownloadableStatus(
                                          item.id_materi,
                                          item.is_downloadable,
                                        )
                                      }
                                      style={[
                                        styles.downloadBadge,
                                        {
                                          backgroundColor: item.is_downloadable
                                            ? '#1E9E43'
                                            : '#B81C1C',
                                        },
                                      ]}
                                    >
                                      <Ionicons
                                        name={
                                          item.is_downloadable
                                            ? 'checkmark-circle-outline'
                                            : 'close-circle-outline'
                                        }
                                        size={13}
                                        color="#fff"
                                      />
                                      <Text style={styles.badgeText}>
                                        {item.is_downloadable
                                          ? 'Download On'
                                          : 'Off'}
                                      </Text>
                                    </TouchableOpacity>
                                  ) : (
                                    // Peserta: hanya tampilkan tombol download jika boleh
                                    item.is_downloadable == 1 && (
                                      <TouchableOpacity
                                        onPress={() => handleDownload(item)}
                                        style={{
                                          backgroundColor: '#1E9E43',
                                          paddingVertical: 6,
                                          paddingHorizontal: 10,
                                          borderRadius: 10,
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          gap: 6,
                                        }}
                                      >
                                        <Ionicons
                                          name="download-outline"
                                          size={16}
                                          color="#fff"
                                        />
                                        <Text
                                          style={{
                                            color: '#fff',
                                            fontSize: 12,
                                            fontWeight: '600',
                                          }}
                                        >
                                          Download
                                        </Text>
                                      </TouchableOpacity>
                                    )
                                  )}
                                </View>
                              </View>
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
        <Modal visible={addModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.newModalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tambah Materi</Text>
              </View>

              {/* Input Tanggal */}
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.inputField}
              >
                <Text
                  style={[
                    styles.inputText,
                    !tanggalMateri && { color: '#aaa' },
                  ]}
                >
                  {tanggalMateri ? formatTanggal(tanggalMateri) : 'dd/mm/yyyy'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#555" />
              </TouchableOpacity>

              {/* Input URL */}
              <View style={styles.inputField}>
                <TextInput
                  placeholder="URL atau Path File"
                  placeholderTextColor="#999"
                  style={styles.inputBox}
                  value={urlFile}
                  onChangeText={setUrlFile}
                />
              </View>

              {/* Switch Option */}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Dapat di-download?</Text>
                <TouchableOpacity
                  onPress={() => setIsDownloadable(isDownloadable ? 0 : 1)}
                >
                  <View
                    style={[
                      styles.switchTrack,
                      isDownloadable && styles.switchActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.switchThumb,
                        isDownloadable && styles.switchThumbActive,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={tanggalMateri}
                  mode="date"
                  display="calendar"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setTanggalMateri(selectedDate);
                      setJudul(generateJudulMateri());
                    }
                  }}
                />
              )}

              {/* Buttons */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setAddModal(false)}
                >
                  <Text style={styles.cancelText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={addLoading}
                  onPress={handleAddMateri}
                  style={[styles.saveBtn, addLoading && { opacity: 0.6 }]}
                >
                  {addLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveText}>Simpan</Text>
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
  greetingBox: { paddingHorizontal: 15 },
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#aaa',
    width: '48%',
    alignItems: 'center',
  },
  saveBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#9D2828',
    width: '48%',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  newModalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  inputField: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  inputText: {
    fontSize: 14,
    color: '#000',
  },

  inputBox: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 20,
  },

  switchLabel: {
    fontSize: 14,
    color: '#000',
  },

  switchTrack: {
    width: 48,
    height: 26,
    borderRadius: 20,
    backgroundColor: '#b5b5b5',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  switchActive: {
    backgroundColor: '#4CAF50',
  },

  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },

  switchThumbActive: {
    alignSelf: 'flex-end',
  },

  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },

  cancelBtn: {
    backgroundColor: '#e6e6e6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },

  cancelText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },

  saveBtn: {
    backgroundColor: '#1E6FF9',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },

  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  badgeDownload: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E9E43',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '600',
  },
  downloadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default MateriListScreen;
