import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from '@react-native-vector-icons/ionicons';

const MateriViewer = ({ route, navigation }) => {
  const { url, title } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#9D2828" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* WebView untuk tampilkan file */}
      <WebView source={{ uri: url }} startInLoadingState style={{ flex: 1 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 55,
    backgroundColor: '#9D2828',
  },
  headerText: {
    marginLeft: 15,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
});

export default MateriViewer;
