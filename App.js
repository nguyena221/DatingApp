import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import your screens
import LoginScreen from './screens/LoginScreen';
import PageSnapContainer from './components/PageSnapContainer';
import DiscoverPage from './components/DiscoverPage';
import EditProfileScreen from './components/EditProfileScreen';
import QuizWithFirebase from './components/PersonalityQuiz'; // This imports the default export
import LifestyleQuizWithFirebase from './components/LifestyleQuiz'; // Adjust if needed

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens for Home and Messages
function HomeScreen() {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>🏠 Home Screen</Text>
      <Text style={styles.placeholderSubtext}>Coming Soon!</Text>
    </View>
  );
}

function MessagesScreen() {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>💬 Messages Screen</Text>
      <Text style={styles.placeholderSubtext}>Coming Soon!</Text>
    </View>
  );
}

// Tab Navigator Component
function TabNavigator() {
  return (
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
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
      />
      <Tab.Screen 
        name="Discover" 
        component={DiscoverPage}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
      />
      <Tab.Screen 
        name="Profile" 
        component={PageSnapContainer}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Auth Stack */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      
      {/* Main App Stack */}
      <Stack.Screen 
        name="Home" 
        component={TabNavigator}
      />
      
      {/* Modal/Overlay Screens */}
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          headerShown: true,
          headerTitle: "Edit Profile",
          headerBackTitle: "Back",
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="PersonalityQuiz" 
        component={QuizWithFirebase}
        options={{
          headerShown: true,
          headerTitle: "Personality Quiz",
          headerBackTitle: "Back",
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="LifestyleQuiz" 
        component={LifestyleQuizWithFirebase}
        options={{
          headerShown: true,
          headerTitle: "Lifestyle Quiz",
          headerBackTitle: "Back",
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
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