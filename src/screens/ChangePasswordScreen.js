import React, { useState } from 'react';
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
import ToastMessage from '../components/ToastMessage';
import Api from '../utils/Api'; // axios instance

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [loading, setLoading] = useState(false);

  // 👁️ toggle visibility
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setToastMessage('Semua field wajib diisi');
      setToastType('error');
      setToastVisible(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setToastMessage('Konfirmasi password tidak sama');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    try {
      setLoading(true);
      const response = await Api.put('/profile/password', {
        password_lama: oldPassword,
        password_baru: newPassword,
        konfirmasi_password_baru: confirmPassword,
      });

      setToastMessage('Password berhasil diperbarui');
      setToastType('success');
      setToastVisible(true);

      setTimeout(() => {
        setToastVisible(false);
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.log(error.response?.data || error.message);
      setToastMessage(
        error.response?.data?.message || 'Gagal mengganti password',
      );
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
        <Text style={styles.headerTitle}>Ganti Password</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Password Lama */}
        <Text style={styles.label}>Password Lama</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Masukkan password lama"
            secureTextEntry={!showOld}
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <TouchableOpacity onPress={() => setShowOld(!showOld)}>
            <Ionicons
              name={showOld ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Password Baru */}
        <Text style={styles.label}>Password Baru</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Masukkan password baru"
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)}>
            <Ionicons
              name={showNew ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Konfirmasi Password Baru */}
        <Text style={styles.label}>Konfirmasi Password Baru</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ulangi password baru"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons
              name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Tombol Simpan */}
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
        message={toastMessage}
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ChangePasswordScreen;
