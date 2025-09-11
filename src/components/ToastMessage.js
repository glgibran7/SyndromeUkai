import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const ToastMessage = ({
  message,
  visible,
  type = 'info', // 'success' | 'warning' | 'error' | 'info'
  position = 'top',
  onHide,
  duration = 3000,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(
    new Animated.Value(position === 'top' ? -50 : 50),
  ).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // reset progress bar
      progressAnim.setValue(1);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }),
      ]).start(() => {
        // animate progress bar
        Animated.timing(progressAnim, {
          toValue: 0,
          duration,
          useNativeDriver: false,
        }).start();

        setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: position === 'top' ? -50 : 50,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onHide && onHide();
          });
        }, duration);
      });
    }
  }, [visible]);

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#ecfdf5',
          color: '#065f46',
          icon: 'checkmark-circle',
          bar: '#10b981',
        };
      case 'warning':
        return {
          bg: '#fffbeb',
          color: '#92400e',
          icon: 'warning',
          bar: '#f59e0b',
        };
      case 'error':
        return {
          bg: '#fef2f2',
          color: '#991b1b',
          icon: 'close-circle',
          bar: '#ef4444',
        };
      default:
        return {
          bg: '#eff6ff',
          color: '#1e3a8a',
          icon: 'information-circle',
          bar: '#3b82f6',
        };
    }
  };

  if (!visible) return null;
  const { bg, color, icon, bar } = getConfig();

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor: bg,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          top: position === 'top' ? 60 : undefined,
          bottom: position === 'bottom' ? 60 : undefined,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={22}
        color={color}
        style={{ marginRight: 10 }}
      />
      <Text style={[styles.toastText, { color }]}>{message}</Text>

      {/* Progress bar */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: bar,
            transform: [{ scaleX: progressAnim }],
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 15,
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  toastText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 15,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    width: '100%',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
});

export default ToastMessage;
