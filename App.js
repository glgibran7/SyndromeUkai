// In App.js in a new project

import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/screens/Login';
import SignUp from './src/screens/SignUp';
import Detail from './src/screens/Detail';
import Splash from './src/screens/Splash';
import Paket from './src/screens/Paket';
import PaketDetail from './src/screens/PaketDetail';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import Profile from './src/screens/Profile';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Detail" component={Detail} />
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Paket" component={Paket} />
        <Stack.Screen name="PaketDetail" component={PaketDetail} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Profile" component={Profile} />

        {/* Add other screens here as needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
