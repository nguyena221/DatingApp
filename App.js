import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import PageSnapContainer from "./components/PageSnapContainer"
import { LinearGradient } from 'expo-linear-gradient';
import QuizWithFirebase from './components/myersbriggs24'

const Stack = createNativeStackNavigator();

export default function App() {
  return (

    /*
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    */

    /*
    <NavigationContainer>
      <PageSnapContainer />
    </NavigationContainer>
    */

    <View style={styles.container}>
      <QuizWithFirebase/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
  }
})