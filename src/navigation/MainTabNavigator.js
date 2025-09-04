import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';

import HomeScreen from '../screens/HomeScreen';
import TryOuttackNavigator from './TryOutStackNavigator';
import HasilTryOut from '../screens/HasilTryOut';
import MateriStackNavigator from './MateriStackNavigator';
import VideoStackNavigator from './VideoStackNavigator';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => {
        const currentRouteName =
          navigation?.getState()?.routes[navigation.getState().index]?.name;

        return {
          headerShown: false,
          tabBarStyle: {
            height: height * 0.1,
            paddingBottom: 10,
            backgroundColor: 'transparent', // Membuat background transparan
            borderTopWidth: 0, // Hapus border atas jika ada
            // Sembunyikan tab bar saat berada di Home
            display: currentRouteName === 'Home' ? 'none' : 'flex',
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={['#9D2828', '#191919']}
              style={{
                flex: 1,
                // Hapus borderRadius untuk menghilangkan sudut membulat
              }}
            />
          ),
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
                iconName = focused
                  ? 'file-tray-full'
                  : 'file-tray-full-outline';
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
          tabBarActiveTintColor: '#FEB600',
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
                  backgroundColor: 'transparent',
                  height: height * 0.1,
                  paddingBottom: 10,
                },
          };
        }}
      />
      <Tab.Screen name="Hasil" component={HasilTryOut} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
