import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import TryOuttackNavigator from './TryOutStackNavigator';
import HasilTryOut from '../screens/HasilTryOut';
import MateriStackNavigator from './MateriStackNavigator';
import VideoStackNavigator from './VideoStackNavigator';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => {
        const currentRouteName =
          navigation?.getState()?.routes[navigation.getState().index]?.name;

        // Menyesuaikan style tab bar
        const isAndroidWithThreeButtonNav =
          Platform.OS === 'android' && !Platform.isTV;

        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#9D2828',
            height: isAndroidWithThreeButtonNav ? 100 : 60, // Untuk perangkat Android dengan navigasi 3 tombol
            paddingBottom: isAndroidWithThreeButtonNav ? 10 : 0, // Menambah ruang bawah untuk perangkat dengan 3 tombol navigasi
            display: currentRouteName === 'Home' ? 'none' : 'flex', // Menyembunyikan tab bar ketika berada di Home
          },
          tabBarLabelStyle: { fontSize: 12 },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Materi':
                iconName = focused ? 'document' : 'document-outline';
                break;
              case 'Video':
                iconName = focused ? 'play-circle' : 'play-circle-outline';
                break;
              case 'TryOut':
                iconName = focused ? 'pencil' : 'pencil-outline';
                break;
              case 'Hasil':
                iconName = focused
                  ? 'document-attach'
                  : 'document-attach-outline';
                break;
              default:
                iconName = 'help-circle-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#fff',
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Materi" component={MateriStackNavigator} />
      <Tab.Screen name="Video" component={VideoStackNavigator} />
      <Tab.Screen
        name="TryOut"
        component={TryOuttackNavigator}
        options={({ route }) => {
          const routeName =
            getFocusedRouteNameFromRoute(route) ?? 'TryOutScreen';
          const isExamScreen = routeName === 'ExamScreen';

          return {
            tabBarStyle: isExamScreen
              ? { display: 'none' }
              : {
                  backgroundColor: '#9D2828',
                  height: 100, // Menyesuaikan untuk perangkat dengan 3 tombol
                  paddingBottom: 10, // Memberikan ruang bawah
                },
          };
        }}
      />
      <Tab.Screen name="Hasil" component={HasilTryOut} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
