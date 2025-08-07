// src/navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';

import HomeScreen from '../screens/HomeScreen';
import VideoScreen from '../screens/VideoScreen';
import MateriScreen from '../screens/MateriScreen';
import TryOutScreen from '../screens/TryOutScreen';
import HasilTryOut from '../screens/HasilTryOut';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => {
        const isHome =
          navigation?.getState()?.routes[navigation.getState().index]?.name ===
          'Home';

        return {
          headerShown: false,
          tabBarStyle: isHome
            ? { display: 'none' } // ✅ Sembunyikan tab menu saat di Home
            : { backgroundColor: '#9D2828', height: 60 },

          tabBarLabelStyle: { fontSize: 12 },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Materi') {
              iconName = focused ? 'document' : 'document-outline';
            } else if (route.name === 'Video') {
              iconName = focused ? 'play-circle' : 'play-circle-outline';
            } else if (route.name === 'TryOut') {
              iconName = focused ? 'pencil' : 'pencil-outline';
            } else if (route.name === 'Hasil') {
              iconName = focused
                ? 'document-attach'
                : 'document-attach-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#fff',
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Materi" component={MateriScreen} />
      <Tab.Screen name="Video" component={VideoScreen} />
      <Tab.Screen name="TryOut" component={TryOutScreen} />
      <Tab.Screen name="Hasil" component={HasilTryOut} />
      {/* <Tab.Screen name="Profile" component={ProfileScreen} /> Uncomment if you have a Profile screen */}
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
