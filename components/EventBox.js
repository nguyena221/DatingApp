import React from "react";
import { View, StyleSheet } from "react-native";
import HalfTab from "./HalfTab";

export default function EventBox() {
  return (
    <View style={styles.container}>
      <HalfTab />
      <HalfTab />
      <HalfTab />
      <HalfTab />
      {/* Add more EventTabs as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // or "space-around"
    gap: 10,
  },
});
