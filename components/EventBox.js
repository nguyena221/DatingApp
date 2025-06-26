import React from "react";
import { View, StyleSheet } from "react-native";
import EventTab from "./EventTab";

export default function EventBox() {
  return (
    <View style={styles.container}>
      <EventTab />
      <EventTab />
      <EventTab />
      <EventTab />
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
