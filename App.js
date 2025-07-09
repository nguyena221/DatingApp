import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserProvider } from './contexts/UserContext';

// Import screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import PageSnapContainer from './components/PageSnapContainer';
import DiscoverPage from './components/DiscoverPage';
import EditProfileScreen from './components/EditProfileScreen';
import QuizWithFirebase from './components/PersonalityQuiz';
import LifestyleQuizWithFirebase from './components/LifestyleQuiz';
import MessagesScreen from './screens/MessagesScreen';
import ChatRoom from './screens/ChatRoom';
import AddBookScreen from './components/AddBookScreen'
import AddMovieScreen from './components/AddMovieScreen';
import AddDestinationScreen from './components/AddDestinationScreen';
import AddFoodieSpotScreen from './components/AddFoodieSpot';
import AddTVShowScreen from './components/AddTVShowScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const [scrollY] = useState(new Animated.Value(0));
  
  // Animate tab bar based on scroll
  const tabBarTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100], // Hide tab bar by moving it down
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Discover') {
              iconName = focused ? 'globe' : 'globe-outline';
            } else if (route.name === 'Messages') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#667eea',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom + 8,
            paddingTop: 8,
            transform: [{ translateY: tabBarTranslateY }],
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Discover" component={DiscoverPage} />
        <Tab.Screen name="Messages" component={MessagesScreen} />
        <Tab.Screen name="Profile">
          {() => <PageSnapContainer scrollY={scrollY} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={TabNavigator} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="AddBook"
        component={AddBookScreen}
        options={{ 
          headerShown: false, 
          presentation: 'modal',
          animationTypeForReplace: 'push'
        }}
      />
      <Stack.Screen
        name="AddMovie"
        component={AddMovieScreen}
        options={{ 
          headerShown: false, 
          presentation: 'modal',
          animationTypeForReplace: 'push'
        }}
      />
      <Stack.Screen
        name="AddDestination"
        component={AddDestinationScreen}
        options={{ 
          headerShown: false, 
          presentation: 'modal',
          animationTypeForReplace: 'push'
        }}
      />
      <Stack.Screen
        name="AddFoodieSpot"
        component={AddFoodieSpotScreen}
        options={{ 
          headerShown: false, 
          presentation: 'modal',
          animationTypeForReplace: 'push'
        }}
      />
      <Stack.Screen
        name="AddTVShow"
        component={AddTVShowScreen}
        options={{ 
          headerShown: false, 
          presentation: 'modal',
          animationTypeForReplace: 'push'
        }}
      />
      <Stack.Screen
        name="PersonalityQuiz"
        component={QuizWithFirebase}
        options={{
          headerShown: true,
          headerTitle: 'Personality Quiz',
          headerBackTitle: 'Back',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="LifestyleQuiz"
        component={LifestyleQuizWithFirebase}
        options={{
          headerShown: true,
          headerTitle: 'Lifestyle Quiz',
          headerBackTitle: 'Back',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoom}
        options={{
          headerShown: true,
          headerTitle: 'Chat',
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </UserProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});