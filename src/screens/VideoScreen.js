import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/Api';
import Header from '../components/Header';
import { useToast } from '../context/ToastContext';
import Ionicons from '@react-native-vector-icons/ionicons';

import EditModulModal from '../components/EditModulModal';
import AddModulModal from '../components/AddModulModal';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

const VideoScreen = ({ navigation }) => {
  const toast = useToast();
  const [modulList, setModulList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectedModul, setSelectedModul] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  const getUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        return parsedUser;
      }
    } catch (error) {
      console.error('Gagal mengambil data user:', error);
    }
    return null;
  };

  const getModul = async () => {
    try {
      const parsedUser = await getUserData();
      const idKelas = await AsyncStorage.getItem('kelas'); // ambil kelas yang dipilih

      let endpoint = '';
      if (parsedUser?.role === 'mentor') {
        endpoint = idKelas ? `/modul/mentor/${idKelas}` : '/modul/mentor';
      } else {
        endpoint = idKelas ? `/modul/user/${idKelas}` : '/modul/user';
      }

      const res = await Api.get(endpoint);

      const data =
        res.data?.status === 'success' ? res.data.data : res.data?.data || [];

      const formatted = data.map(item => ({
        id_modul: item.id_modul,
        title: item.judul,
        desc: item.deskripsi,
        visibility: item.visibility,
        order: item.urutan_modul,
        id_paketkelas: item.id_paketkelas,
        icon: require('../../src/img/icon_folder.png'),
        backgroundColor: '#FFF8E3',
      }));

      setModulList(formatted);
      setFilteredList(formatted);
    } catch (error) {
      toast.show('Gagal: Tidak bisa mengambil data modul', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getUserData();
    getModul();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getModul();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredList(modulList);
    } else {
      const filtered = modulList.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredList(filtered);
    }
  }, [searchQuery, modulList]);

  const handleChangeVisibility = async (id_modul, newStatus) => {
    try {
      await Api.put(`/modul/${id_modul}/visibility`, { visibility: newStatus });
      setModulList(prev =>
        prev.map(m =>
          m.id_modul === id_modul ? { ...m, visibility: newStatus } : m,
        ),
      );
      toast.show(`Visibility modul diubah ke ${newStatus}`, 'success');
    } catch (err) {
      toast.show('Tidak bisa mengubah visibility modul', 'error');
    }
  };

  const openEditModal = modul => {
    setSelectedModul(modul);
    setEditModal(true);
  };

  const handleEditSubmit = async updated => {
    if (!updated) return;
    try {
      setSaving(true);
      const payload = {
        id_paketkelas: updated.id_paketkelas,
        judul: updated.title,
        deskripsi: updated.desc,
      };
      await Api.put(`/modul/${updated.id_modul}`, payload);
      await Api.put(`/modul/${updated.id_modul}/visibility`, {
        visibility: updated.visibility,
      });
      setEditModal(false);
      getModul();
      toast.show('Modul berhasil diperbarui', 'success');
    } catch (err) {
      toast.show('Tidak bisa menyimpan modul', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async modul => {
    if (!modul) return;
    Alert.alert(
      'Konfirmasi',
      `Apakah Anda yakin ingin menghapus modul "${modul.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await Api.delete(`/modul/${modul.id_modul}`);
              setEditModal(false);
              getModul();
              toast.show('Modul berhasil dihapus', 'success');
            } catch (err) {
              toast.show('Tidak bisa menghapus modul', 'error');
            }
          },
        },
      ],
    );
  };

  const handleAddSubmit = async data => {
    if (!data?.title || !data?.desc) {
      toast.show('Harap isi semua field', 'warning');
      return;
    }
    try {
      setAdding(true);
      await Api.post('/modul/mentor', {
        judul: data.title,
        deskripsi: data.desc,
        visibility: 'open',
      });
      setAddModal(false);
      getModul();
      toast.show('Modul baru berhasil ditambahkan', 'success');
    } catch (err) {
      toast.show('Tidak bisa menambah modul', 'error');
    } finally {
      setAdding(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <LinearGradient
        colors={['#9D2828', '#191919']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Memuat modul...</Text>
      </LinearGradient>
    );
  }

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
            colors={['#9D2828']}
            tintColor="#fff"
          />
        }
      >
        <Header navigation={navigation} />

        <View style={styles.greetingBox}>
          <Text style={styles.greeting}>Video</Text>
          <Text style={styles.subtext}>Kumpulan materi video lengkap</Text>

          {/* Search bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari modul..."
              placeholderTextColor="#fff"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search-outline" size={18} color="#fff" />
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Daftar Modul</Text>
            {user?.role === 'mentor' && (
              <TouchableOpacity
                onPress={() => setAddModal(true)}
                style={styles.addButton}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  + Tambah Modul
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.menuGrid}>
            {filteredList.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#555' }}>
                Tidak ada modul tersedia
              </Text>
            ) : (
              filteredList.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.menuItem,
                    { backgroundColor: item.backgroundColor },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('VideoListScreen', {
                        id_modul: item.id_modul,
                      })
                    }
                  >
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <View style={styles.menuIconContainer}>
                      <Image source={item.icon} style={styles.menuIcon} />
                    </View>
                  </TouchableOpacity>

                  {user?.role === 'mentor' && (
                    <View style={{ marginTop: 10 }}>
                      <View style={styles.dropdownContainer}>
                        {['open', 'hold', 'close'].map(opt => (
                          <TouchableOpacity
                            key={opt}
                            style={[
                              styles.option,
                              item.visibility === opt && {
                                backgroundColor:
                                  opt === 'open'
                                    ? '#4CAF50'
                                    : opt === 'hold'
                                    ? '#FFEB3B'
                                    : '#F44336',
                              },
                            ]}
                            onPress={() =>
                              handleChangeVisibility(item.id_modul, opt)
                            }
                          >
                            <Text
                              style={{
                                color:
                                  item.visibility === opt
                                    ? '#fff'
                                    : opt === 'open'
                                    ? '#4CAF50'
                                    : opt === 'hold'
                                    ? '#FBC02D'
                                    : '#F44336',
                                fontWeight: 'bold',
                              }}
                            >
                              {opt.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <TouchableOpacity
                        onPress={() => openEditModal(item)}
                        style={styles.editButton}
                      >
                        <Text style={{ color: '#fff' }}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal Tambah */}
      <AddModulModal
        visible={addModal}
        onClose={() => setAddModal(false)}
        onSave={handleAddSubmit}
        loading={adding}
      />

      {/* Modal Edit */}
      <EditModulModal
        visible={editModal}
        modul={selectedModul}
        onClose={() => setEditModal(false)}
        onSave={handleEditSubmit}
        onDelete={handleDelete}
        loading={saving}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  greetingBox: { paddingHorizontal: 15 },
  greeting: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
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
  searchInput: { flex: 1, height: 40, color: '#000' },
  mainContent: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 30,
    minHeight: height - 200,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },

  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // SELALU rata kiri
  },

  menuItem: {
    width: isTablet ? width * 0.28 : width * 0.4,
    // Tablet: ideal untuk 3 tetapi kalau datanya kurang tetap 2 karena masih lebar
    borderRadius: 15,
    padding: 15,
    marginRight: 10,
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

  menuIconContainer: { alignSelf: 'flex-end' },
  menuIcon: { width: 50, height: 50, resizeMode: 'contain', marginTop: 10 },

  dropdownContainer: { flexDirection: 'row', marginTop: 5 },
  option: {
    padding: width * 0.002,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 2,
  },

  editButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
});

export default VideoScreen;
