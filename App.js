// In App.js in a new project

import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import Detail from './src/screens/Detail';
import Splash from './src/screens/Splash';
import Paket from './src/screens/Paket'; // Assuming Paket is a screen you want to include
import PaketDetail from './src/screens/PaketDetail'; // Assuming PaketDetail is another screen

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Detail" component={Detail} />
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Paket" component={Paket} />
        <Stack.Screen name="PaketDetail" component={PaketDetail} />
        {/* Add other screens here as needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
