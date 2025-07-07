import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  ScrollView,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';

const App = () => {
  const [loading, setLoading] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: '#d1dbf9' }}>
      <StatusBar barStyle={'dark-content'} />
      <View
        style={{
          backgroundColor: 'white',
          padding: 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      >
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            paddingTop: 20,
            fontSize: 18,
            fontFamily: 'poppins',
            elevation: 3,
          }}
        >
          SynromeUkai
        </Text>
      </View>
      <ActivityIndicator
        animating={loading}
        size={'large'}
        color={'#000000'}
      ></ActivityIndicator>
      <TouchableOpacity onPress={() => setLoading(!loading)}>
        <Text>tes</Text>
      </TouchableOpacity>
    </View>
  );
};

export default App;
