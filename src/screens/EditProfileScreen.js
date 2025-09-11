import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import ToastMessage from '../components/ToastMessage';
import Api from '../utils/Api';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useContext(AuthContext);

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [noHp, setNoHp] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('info');

  // ambil data profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await Api.get('/profile');
        const profile = res.data.data; // ✅ ambil dari data.data

        setNama(profile.nama || '');
        setEmail(profile.email || '');
        setNoHp(profile.no_hp || '');

        // ✅ update juga ke context supaya global sinkron
        setUser(prev => ({
          ...prev,
          name: profile.nama,
          email: profile.email,
          no_hp: profile.no_hp,
        }));
      } catch (err) {
        setToastMsg('Gagal memuat profil');
        setToastType('error');
        setToastVisible(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!nama.trim()) {
      setToastMsg('Nama tidak boleh kosong');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    try {
      setLoading(true);

      // PUT sesuai API
      const res = await Api.put('/profile', {
        nama,
        no_hp: noHp,
      });

      const updated = res.data; // respons PUT hanya { nama, no_hp }

      // ✅ update context biar sinkron di semua screen
      setUser(prev => ({
        ...prev,
        name: updated.nama,
        no_hp: updated.no_hp,
        email: email, // email tetap dari hasil GET
      }));

      setToastMsg('Profil berhasil diperbarui');
      setToastType('success');
      setToastVisible(true);

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      setToastMsg('Gagal memperbarui profil');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Nama</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan nama"
          value={nama}
          onChangeText={setNama}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={email}
          editable={false}
        />

        <Text style={styles.label}>No HP</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan nomor HP"
          value={noHp}
          onChangeText={setNoHp}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Simpan</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Toast */}
      <ToastMessage
        message={toastMsg}
        visible={toastVisible}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEAEA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: 40,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  form: { marginTop: 30, paddingHorizontal: 20 },
  label: { fontSize: 14, color: '#333', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  disabledInput: { backgroundColor: '#f2f2f2', color: '#888' },
  saveBtn: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default EditProfileScreen;
