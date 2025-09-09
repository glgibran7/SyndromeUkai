import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const navigation = useNavigation();
  const { user, handleLogout } = useContext(AuthContext);

  // Ambil inisial nama user
  const getInitials = name => {
    if (!name) return '-';
    const parts = name.split(' ');
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} /> {/* biar judul tetap center */}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar + Nama */}
        <View style={styles.profileSection}>
          <View>
            <View style={styles.avatarInitial}>
              <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
            </View>
            <TouchableOpacity style={styles.editIcon}>
              <Ionicons name="pencil" size={14} color="#555" />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{user?.name || 'User'}</Text>
        </View>

        {/* Menu List */}
        <View style={styles.menu}>
          {/* <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="star" size={20} color="#444" />
            <Text style={styles.menuText}>Upgrade Paket</Text>
            <Ionicons name="chevron-forward" size={20} color="#444" />
          </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="globe-outline" size={20} color="#444" />
            <Text style={styles.menuText}>Bahasa</Text>
            <Ionicons name="chevron-forward" size={20} color="#444" />
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AboutScreen')}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#444"
            />
            <Text style={styles.menuText}>Tentang Syndrome Ukai</Text>
            <Ionicons name="chevron-forward" size={20} color="#444" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HelpScreen')}
          >
            <Ionicons name="help-circle-outline" size={20} color="#444" />
            <Text style={styles.menuText}>Bantuan</Text>
            <Ionicons name="chevron-forward" size={20} color="#444" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAEAEA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatarInitial: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#000',
  },
  menu: {
    marginTop: 25,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 15,
    color: '#000',
  },
  logoutBtn: {
    marginTop: 30,
    marginHorizontal: 40,
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Profile;
