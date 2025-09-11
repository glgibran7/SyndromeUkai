import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import ToastMessage from '../components/ToastMessage'; // pastikan path benar

const ChangeNameScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [newName, setNewName] = useState(user?.name || '');
  const [toastVisible, setToastVisible] = useState(false);

  const handleSave = () => {
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      navigation.goBack();
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ganti Nama</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Input */}
      <View style={styles.form}>
        <Text style={styles.label}>Nama Baru</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan nama baru"
          value={newName}
          onChangeText={setNewName}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Simpan</Text>
        </TouchableOpacity>
      </View>

      {/* Toast */}
      <ToastMessage
        message="Fitur ini masih dalam pengembangan"
        visible={toastVisible}
        type="info"
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
  saveBtn: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ChangeNameScreen;
