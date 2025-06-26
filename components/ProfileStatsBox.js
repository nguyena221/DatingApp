import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";

let name = "Jane Doe";

export default function ProfileStatsBox() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fcca59",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    borderRadius: 40,
    padding: 30,
    gap: 15,
  },
  text: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#333",
  },
});
