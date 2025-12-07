import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
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
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const renderIcon = () => {
    switch (type) {
      case 'submitConfirm':
      case 'exitConfirm':
        return <Ionicons name="warning-outline" size={55} color="#F2B705" />;
      case 'success':
      case 'result':
        return (
          <Ionicons name="checkmark-circle-outline" size={55} color="#27AE60" />
        );
      case 'error':
        return (
          <Ionicons name="close-circle-outline" size={55} color="#E63946" />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="none" transparent>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalBox,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {renderIcon()}
          <Text style={styles.title}>{title}</Text>

          {message && <Text style={styles.message}>{message}</Text>}

          {children ? (
            <View style={{ width: '100%', marginTop: 10 }}>{children}</View>
          ) : null}

          <View style={styles.btnRow}>
            {onClose && (
              <TouchableOpacity
                style={[styles.button, styles.outlineBtn]}
                onPress={onClose}
              >
                <Text style={styles.outlineText}>Tutup</Text>
              </TouchableOpacity>
            )}

            {onConfirm && (
              <TouchableOpacity
                style={[styles.button, styles.primaryBtn]}
                onPress={onConfirm}
              >
                <Text style={styles.primaryText}>Lanjut</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AppModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    width: width * 0.85,
    backgroundColor: '#fff',
    paddingVertical: 25,
    paddingHorizontal: 23,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
    color: '#171717',
  },
  message: {
    color: '#515151',
    marginTop: 10,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 12,
  },
  outlineBtn: {
    borderWidth: 1.7,
    borderColor: '#9D2828',
    backgroundColor: '#fff',
  },
  outlineText: {
    fontWeight: '600',
    color: '#9D2828',
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: '#9D2828',
  },
  primaryText: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 14,
  },
});
