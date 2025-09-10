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
  Modal,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/Api';
import Header from '../components/Header';
import { useToast } from '../context/ToastContext';
import Ionicons from '@react-native-vector-icons/ionicons';

const { width, height } = Dimensions.get('window');

const MateriScreen = ({ navigation }) => {
  const toast = useToast();
  const [modulList, setModulList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectedModul, setSelectedModul] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [visibility, setVisibility] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');

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
      const endpoint = parsedUser?.role === 'mentor' ? '/modul' : '/modul/user';
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
        wave: require('../../src/img/wave1.png'),
      }));

      setModulList(formatted);
      setFilteredList(formatted);
    } catch (error) {
      toast.show({
        type: 'error',
        text1: 'Gagal',
        text2: 'Tidak bisa mengambil data modul',
      });
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
    setNewTitle(modul.title);
    setNewDesc(modul.desc);
    setVisibility(modul.visibility || 'open');
    setEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedModul) return;
    try {
      const payload = {
        id_paketkelas: selectedModul.id_paketkelas,
        judul: newTitle,
        deskripsi: newDesc,
      };
      await Api.put(`/modul/${selectedModul.id_modul}`, payload);
      await Api.put(`/modul/${selectedModul.id_modul}/visibility`, {
        visibility,
      });
      setEditModal(false);
      getModul();
      toast.show('Modul berhasil diperbarui', 'success');
    } catch (err) {
      toast.show('Tidak bisa menyimpan modul', 'error');
    }
  };

  const handleAddSubmit = async () => {
    if (!newTitle || !newDesc) {
      toast.show('Harap isi semua field', 'warning');
      return;
    }
    try {
      setAddLoading(true);
      await Api.post('/modul/mentor', {
        judul: newTitle,
        deskripsi: newDesc,
        visibility: 'open',
      });
      setAddModal(false);
      setNewTitle('');
      setNewDesc('');
      getModul();
      toast.show('Modul baru berhasil ditambahkan', 'success');
    } catch (err) {
      toast.show('Tidak bisa menambah modul', 'error');
    } finally {
      setAddLoading(false);
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
          <Text style={styles.greeting}>Materi</Text>
          <Text style={styles.subtext}>Kumpulan materi bacaan lengkap</Text>

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
                      navigation.navigate('MateriList', {
                        id_modul: item.id_modul,
                      })
                    }
                  >
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    {/* <Text style={styles.menuDesc}>{item.desc}</Text> */}
                    <View style={styles.menuIconContainer}>
                      <Image source={item.icon} style={styles.menuIcon} />
                    </View>
                    <Image source={item.wave} style={styles.waveImage} />
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
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 24 }}>
              Tambah Modul
            </Text>
            <Text style={styles.keteranganText}>Judul Modul</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.input}
              placeholder="Masukkan judul"
            />
            <Text style={styles.keteranganText}>Deskripsi Modul</Text>
            <TextInput
              value={newDesc}
              onChangeText={setNewDesc}
              style={styles.input}
              placeholder="Masukkan deskripsi"
              multiline
            />
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => setAddModal(false)}
                style={[styles.editButton, { backgroundColor: 'gray' }]}
              >
                <Text style={{ color: '#fff' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddSubmit}
                disabled={addLoading}
                style={[
                  styles.editButton,
                  { marginLeft: 10, opacity: addLoading ? 0.7 : 1 },
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

      {/* Modal Edit */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 24 }}>Edit Modul</Text>
            <Text style={styles.keteranganText}>Judul Modul</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.input}
              placeholder="Judul Modul"
            />
            <Text style={styles.keteranganText}>Deskripsi Modul</Text>
            <TextInput
              value={newDesc}
              onChangeText={setNewDesc}
              style={styles.input}
              placeholder="Deskripsi Modul"
              multiline
            />
            <Text style={styles.keteranganText}>Visibility</Text>
            <View style={styles.dropdownContainer}>
              {['open', 'hold', 'close'].map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.option,
                    visibility === opt && {
                      backgroundColor:
                        opt === 'open'
                          ? '#4CAF50'
                          : opt === 'hold'
                          ? '#FFEB3B'
                          : '#F44336',
                    },
                  ]}
                  onPress={() => setVisibility(opt)}
                >
                  <Text
                    style={{
                      color:
                        visibility === opt
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
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => setEditModal(false)}
                style={[styles.editButton, { backgroundColor: 'gray' }]}
              >
                <Text style={{ color: '#fff' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEditSubmit}
                style={[styles.editButton, { marginLeft: 10 }]}
              >
                <Text style={{ color: '#fff' }}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    textTransform: 'capitalize',
  },
  menuDesc: { fontSize: 10, color: '#555', marginTop: 2 },
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
    height: 80,
    width: 'auto',
    resizeMode: 'stretch',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    zIndex: -1,
  },
  dropdownContainer: { flexDirection: 'row', marginTop: 5 },
  option: {
    padding: width * 0.005,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
  },
  editButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  keteranganText: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});

export default MateriScreen;
