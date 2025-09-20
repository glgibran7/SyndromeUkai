// In App.js in a new project
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ToastProvider } from './src/context/ToastContext';
import Toast from 'react-native-toast-message';

import Login from './src/screens/Login';
import SignUp from './src/screens/SignUp';
import Detail from './src/screens/Detail';
import Splash from './src/screens/Splash';
import Paket from './src/screens/Paket';
import PaketDetail from './src/screens/PaketDetail';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import Profile from './src/screens/Profile';
import ForgotPassword from './src/screens/ForgotPassword';
import AboutScreen from './src/screens/AboutScreen';
import HelpScreen from './src/screens/HelpScreen';
import ChangePassword from './src/screens/ChangePasswordScreen';
import EditProfile from './src/screens/EditProfileScreen';

import { navigationRef } from './src/utils/NavigationService';
import { KelasProvider } from './src/context/KelasContext';
import { AuthProvider } from './src/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider navigationRef={navigationRef}>
          <KelasProvider>
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
                <Stack.Screen name="AboutScreen" component={AboutScreen} />
                <Stack.Screen
                  name="ForgotPassword"
                  component={ForgotPassword}
                />
                <Stack.Screen name="HelpScreen" component={HelpScreen} />
                <Stack.Screen name="EditProfile" component={EditProfile} />
                <Stack.Screen
                  name="ChangePassword"
                  component={ChangePassword}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </KelasProvider>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default App;
