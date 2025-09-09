import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';

const HelpScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* StatusBar */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bantuan</Text>
        <View style={{ width: 24 }} /> {/* biar judul tetap center */}
      </View>

      {/* Konten Bantuan */}
      <View style={styles.content}>
        <Text style={styles.text}>
          Jika mengalami kendala, hubungi tim support melalui:
        </Text>
        <Text style={styles.item}>Email: admin@syndromeukai.id</Text>
        <Text style={styles.item}>WhatsApp: +6281213007505</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: 40,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  content: { flex: 1, padding: 20 },
  text: { fontSize: 15, color: '#444', marginBottom: 15, lineHeight: 22 },
  item: { fontSize: 15, color: '#000', marginBottom: 8 },
});

export default HelpScreen;
