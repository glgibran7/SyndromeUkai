import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const ToastMessage = ({ message, visible, type = 'error', onHide }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            onHide && onHide();
          });
        }, 3000);
      });
    }
  }, [visible]);

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#d4edda';
      case 'warning':
        return '#fff3cd';
      default:
        return '#f8d7da';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return '#155724';
      case 'warning':
        return '#856404';
      default:
        return '#721c24';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      default:
        return '❌';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { backgroundColor: getColor(), opacity: fadeAnim },
      ]}
    >
      <Text style={[styles.toastText, { color: getTextColor() }]}>
        {getIcon()} {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 8,
    padding: 12,
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  toastText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ToastMessage;
