import React from "react";
import {View, Text, TouchableOpacity} from "react-native";
import styles from "../styles/LoginScreenStyle"

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