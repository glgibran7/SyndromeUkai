import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Button } from 'react-native/types_generated/index';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <StatusBar barStyle={'dark-content'} />
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 90,
          }}
        >
          <Image
            source={require('../../src/img/bg_ukai_new.png')}
            style={{ width: 250, height: 100 }}
          />
        </View>

        <View
          style={{
            justifyContent: 'center',
            backgroundColor: '#981417',
            padding: 20,
            marginHorizontal: 30,
            borderRadius: 20,
            marginTop: 50,
            marginBottom: 20,
          }}
        >
          <View style={{ paddingHorizontal: 5 }}>
            <Text
              style={{
                fontSize: 30,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
              }}
            >
              Login
            </Text>
            <Text style={{ color: 'white', marginTop: 20 }}>Email</Text>
            <TextInput
              value={email}
              style={styles.inputtext}
              placeholder="Masukkan Email"
              placeholderTextColor="gray"
              onChangeText={teks => setEmail(teks)}
            ></TextInput>
            <Text style={{ color: 'white' }}>Password</Text>
            <TextInput
              value={password}
              style={styles.inputtext}
              placeholder="Masukkan Password"
              placeholderTextColor="gray"
              onChangeText={teks => setPassword(teks)}
              secureTextEntry
            ></TextInput>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <TouchableOpacity
                style={styles.tombol}
                onPress={() => navigation.navigate('Home')}
              >
                <Text
                  style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}
                >
                  Login
                </Text>
              </TouchableOpacity>
            </View>
            {/* <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <TouchableOpacity
                style={[styles.tombol, { backgroundColor: 'green' }]}
              >
                <Text
                  style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tombol: {
    backgroundColor: 'blue',
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  inputtext: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 4,
    color: '#000000',
    paddingLeft: 10,
    fontSize: 14,
  },
});

export default Login;
