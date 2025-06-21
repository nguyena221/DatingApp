import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>This is for the Profile screen.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  text: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
  },
});
