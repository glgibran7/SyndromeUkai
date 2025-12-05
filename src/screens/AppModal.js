import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const { width } = Dimensions.get('window');

const AppModal = ({
  visible,
  onClose,
  onConfirm,
  type,
  title,
  message,
  children,
}) => {
  const renderIcon = () => {
    switch (type) {
      case 'submitConfirm':
      case 'exitConfirm':
        return <Ionicons name="warning-outline" size={40} color="#DFA529" />;
      case 'success':
      case 'result':
        return (
          <Ionicons name="checkmark-circle-outline" size={40} color="#2ECC71" />
        );
      case 'error':
        return (
          <Ionicons name="close-circle-outline" size={40} color="#E74C3C" />
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {renderIcon()}
          <Text style={styles.title}>{title}</Text>

          {message && <Text style={styles.message}>{message}</Text>}

          {children}

          <View style={styles.btnRow}>
            {onClose && (
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={onClose}
              >
                <Text style={styles.btnGhostText}>Batal</Text>
              </TouchableOpacity>
            )}

            {onConfirm && (
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={onConfirm}
              >
                <Text style={styles.btnPrimaryText}>Lanjut</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AppModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: width * 0.85,
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 18,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    color: '#111',
  },
  message: {
    color: '#444',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 10,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  btnGhost: {
    backgroundColor: '#ddd',
  },
  btnGhostText: {
    fontWeight: 'bold',
    color: '#333',
  },
  btnPrimary: {
    backgroundColor: '#9D2828',
  },
  btnPrimaryText: {
    fontWeight: 'bold',
    color: '#fff',
  },
});
