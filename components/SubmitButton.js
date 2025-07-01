import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/LoginScreenStyle"

export default function SubmitButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.loginButton} onPress={onPress}>
      <Ionicons name="arrow-forward" size={28} color="#fff" />
    </TouchableOpacity>
  );
}