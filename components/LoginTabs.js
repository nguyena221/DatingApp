import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function AuthTabs({ activeTab, setActiveTab, setIsLogin }) {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "LOGIN" && styles.activeTab]}
        onPress={() => {
          setActiveTab("LOGIN");
          setIsLogin(true);
        }}
      >
        <Text
          style={[styles.tabText, activeTab === "LOGIN" && styles.activeTabText]}
        >
          Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "REGISTER" && styles.activeTab]}
        onPress={() => {
          setActiveTab("REGISTER");
          setIsLogin(false);
        }}
      >
        <Text
          style={[styles.tabText, activeTab === "REGISTER" && styles.activeTabText]}
        >
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
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderColor: "transparent",
    marginHorizontal: 10,
  },
  activeTab: {
    borderColor: "#000", // accent color for active tab underline
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#000", // darker color for active tab label
  },
});
