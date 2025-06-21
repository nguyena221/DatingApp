import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  const helloName = "John"; // we can change this later to work dynamically

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.helloContainer}>
        <Text style={styles.helloText}>
          Hello, <Text style={styles.nameText}>{helloName}</Text>!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  helloContainer: {
    padding: 30,
  },
  helloText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
  },
});
