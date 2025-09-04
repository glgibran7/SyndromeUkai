// In App.js in a new project
import * as React from 'react';
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
import ForgotPassword from './src/screens/ForgotPassword';

// ⬅️ import navigationRef
import { navigationRef } from './src/utils/NavigationService';

// ⬅️ import AuthProvider
import { AuthProvider } from './src/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider navigationRef={navigationRef}>
        <NavigationContainer ref={navigationRef}>
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
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
