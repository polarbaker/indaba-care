import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Ionicons } from '@expo/vector-icons';

// Auth screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';

// Main screens
import DashboardScreen from './src/screens/DashboardScreen';
import ChildrenScreen from './src/screens/ChildrenScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import PhotosScreen from './src/screens/PhotosScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Contexts
import { AuthProvider } from './src/contexts/AuthContext';
import { NetworkProvider } from './src/contexts/NetworkContext';

// Create navigation stacks
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Create React Query client
const queryClient = new QueryClient();

// Define theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3182ce', // blue.500 in Chakra UI
    accent: '#63b3ed', // blue.300 in Chakra UI
    background: '#f5f5f5',
    surface: '#ffffff',
  },
};

// Tab navigator for main app screens
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Children') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Resources') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Photos') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3182ce',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Children" component={ChildrenScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Photos" component={PhotosScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Main app component
export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <NetworkProvider>
            <AuthProvider>
              <NavigationContainer>
                <StatusBar style="auto" />
                <Stack.Navigator initialRouteName="Login">
                  {/* Auth flow */}
                  <Stack.Screen 
                    name="Login" 
                    component={LoginScreen} 
                    options={{ headerShown: false }} 
                  />
                  <Stack.Screen 
                    name="Register" 
                    component={RegisterScreen} 
                    options={{ title: 'Create Account' }} 
                  />
                  <Stack.Screen 
                    name="ForgotPassword" 
                    component={ForgotPasswordScreen} 
                    options={{ title: 'Reset Password' }} 
                  />
                  
                  {/* Main app flow */}
                  <Stack.Screen 
                    name="Main" 
                    component={HomeTabs} 
                    options={{ headerShown: false }} 
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </AuthProvider>
          </NetworkProvider>
        </QueryClientProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
