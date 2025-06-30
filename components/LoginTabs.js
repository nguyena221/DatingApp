import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function AuthTabs({ activeTab, setActiveTab, setIsLogin }) {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        onPress={() => {
          setActiveTab("LOGIN");
          setIsLogin(true);
        }}
      >
        <Text style={[styles.tab, activeTab === "LOGIN" && styles.activeTab]}>
          Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setActiveTab("REGISTER");
          setIsLogin(false);
        }}
      >
        <Text style={[styles.tab, activeTab === "REGISTER" && styles.activeTab]}>
          Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  tab: {
    marginHorizontal: 20,
    fontSize: 18,
    color: "#888",
  },
  activeTab: {
    color: "#1b475d",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
