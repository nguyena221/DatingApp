// App.js or Navigation.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreenTest from "./screens/LogInScreen-test";
import HomeScreen from "./screens/HomeScreen";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import PageSnapContainer from "./components/PageSnapContainer"
import { LinearGradient } from 'expo-linear-gradient';

const Stack = createNativeStackNavigator();

export default function App() {
  return (

    /*
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreenTest} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    */

    <NavigationContainer>
      <PageSnapContainer />
    </NavigationContainer>
  );
}
