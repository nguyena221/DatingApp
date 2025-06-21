import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ProfileScreen from "../screens/ProfileScreen";
//import { CurrentRenderContext } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

export default function BottomNavBar() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 30,
    width: 300,
    height: 70,
    backgroundColor: "#fff",
    borderRadius: 35,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
    left: "50%",
    marginLeft: 60, // im still looking at other ways to center the navbar
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
});
