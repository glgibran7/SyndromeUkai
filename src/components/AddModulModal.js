import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

const { width } = Dimensions.get('window');

const AddModulModal = ({ visible, onClose, onSave, loading = false }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [visibility, setVisibility] = useState('open');

  const handleSave = () => {
    if (!title || !desc) return;
    onSave({ title, desc, visibility });
    setTitle('');
    setDesc('');
    setVisibility('open');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={{ fontWeight: 'bold', fontSize: 24 }}>Tambah Modul</Text>

          <Text style={styles.keteranganText}>Judul Modul</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholder="Judul Modul"
          />

          <Text style={styles.keteranganText}>Deskripsi Modul</Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
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

          <View
            style={{ flexDirection: 'row', marginTop: 15, flexWrap: 'wrap' }}
          >
            {/* Batal */}
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, { backgroundColor: 'gray' }]}
            >
              <Text style={{ color: '#fff' }}>Batal</Text>
            </TouchableOpacity>

            {/* Simpan */}
            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.button,
                { backgroundColor: '#28a745', marginLeft: 8 },
              ]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff' }}>Simpan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 5,
  },
  dropdownContainer: { flexDirection: 'row', marginTop: 5 },
  option: {
    padding: width * 0.01,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
  },
  keteranganText: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 8,
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: 70,
  },
});

export default AddModulModal;
