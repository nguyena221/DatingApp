import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import HalfTab from "./HalfTab";

let name = "Jane Doe";

export default function ProfileStatsBox() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{name}</Text>
      <View style={styles.bio}>
        <HalfTab />
        <HalfTab />
      </View>
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
  bio: {
    paddingVertical: 10, 
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  text: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#333",
  },
});
