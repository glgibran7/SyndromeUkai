import React, { useEffect, useState, useCallback, useContext } from 'react';
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
import { KelasContext } from '../context/KelasContext';

import EditModulModal from '../components/EditModulModal';
import AddModulModal from '../components/AddModulModal';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

// ==== SOLID RANDOM COLORS ====
const cardColors = [
  '#FFEBEE',
  '#E3F2FD',
  '#E8F5E9',
  '#FFF3E0',
  '#EDE7F6',
  '#F3E5F5',
  '#D1C4E9',
  '#FFE0B2',
  '#B3E5FC',
  '#DCEDC8',
];

const MateriScreen = ({ navigation }) => {
  const toast = useToast();
  const { kelasAktif, isWaliKelas } = useContext(KelasContext);
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
      const idKelas = await AsyncStorage.getItem('kelas');

      let endpoint =
        parsedUser?.role === 'mentor'
          ? idKelas
            ? `/modul/mentor/${idKelas}`
            : '/modul/mentor'
          : idKelas
          ? `/modul/user/${idKelas}`
          : '/modul/user';

      const res = await Api.get(endpoint);
      const data = res.data?.data || [];

      const formatted = data.map((item, index) => ({
        id_modul: item.id_modul,
        title: item.judul,
        desc: item.deskripsi,
        visibility: item.visibility,
        order: item.urutan_modul,
        id_paketkelas: item.id_paketkelas,
        icon: require('../../src/img/icon_folder.png'),
        color: cardColors[index % cardColors.length],
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

  useEffect(() => {
    getModul();
  }, [kelasAktif, isWaliKelas]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getModul();
  }, [kelasAktif, isWaliKelas]);

  useEffect(() => {
    setFilteredList(
      !searchQuery
        ? modulList
        : modulList.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
    );
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
    } catch {
      toast.show('Tidak bisa mengubah visibility modul', 'error');
    }
  };

  const handleAddSubmit = async data => {
    if (!data?.title || !data?.desc)
      return toast.show('Harap isi semua field', 'warning');
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
    } catch {
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

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Cari modul..."
              placeholderTextColor="#fff"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
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
                <TouchableOpacity
                  key={index}
                  style={[styles.menuItem, { backgroundColor: item.color }]}
                  onPress={() =>
                    navigation.navigate('MateriList', {
                      id_modul: item.id_modul,
                    })
                  }
                >
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Image source={item.icon} style={styles.menuIcon} />

                  {user?.role === 'mentor' && (
                    <>
                      <View style={styles.dropdownContainer}>
                        {['open', 'hold', 'close'].map(opt => (
                          <TouchableOpacity
                            key={opt}
                            style={[
                              styles.option,
                              item.visibility === opt && styles[`opt_${opt}`],
                            ]}
                            onPress={() =>
                              handleChangeVisibility(item.id_modul, opt)
                            }
                          >
                            <Text
                              style={{
                                fontWeight: 'bold',
                                color:
                                  item.visibility === opt ? '#fff' : '#333',
                              }}
                            >
                              {opt.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <TouchableOpacity
                        onPress={() => setEditModal(item)}
                        style={styles.editButton}
                      >
                        <Text style={{ color: '#fff' }}>Edit</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      <AddModulModal
        visible={addModal}
        onClose={() => setAddModal(false)}
        onSave={handleAddSubmit}
        loading={adding}
      />
      <EditModulModal
        visible={editModal}
        modul={selectedModul}
        onClose={() => setEditModal(false)}
        onSave={() => {}}
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
    backgroundColor: '#ffffff40',
    borderRadius: 15,
    paddingHorizontal: 10,
    marginTop: 15,
  },
  searchInput: { flex: 1, color: '#fff', height: 40 },

  mainContent: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 30,
    minHeight: height - 200,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },

  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  menuItem: {
    width: isTablet ? width * 0.28 : width * 0.42,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },

  menuTitle: { fontWeight: 'bold', fontSize: 17, color: '#700101' },
  menuIcon: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    marginTop: 10,
  },

  dropdownContainer: { flexDirection: 'row', marginTop: 10 },
  option: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginRight: 5,
  },

  opt_open: { backgroundColor: '#4CAF50' },
  opt_hold: { backgroundColor: '#FFB300' },
  opt_close: { backgroundColor: '#E53935' },

  editButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#007bff',
    borderRadius: 6,
    alignItems: 'center',
  },

  addButton: { backgroundColor: '#28a745', padding: 8, borderRadius: 6 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
});

export default MateriScreen;
