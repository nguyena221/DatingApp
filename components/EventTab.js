import React from "react";
import {View, StyleSheet, Dimensions} from "react-native";

const { width } = Dimensions.get("window");

export default function EventTab() {
  return <View style={styles.eventTabs}></View>;
}

const styles = StyleSheet.create({
  eventTabs: {
    backgroundColor: '#e6edfc',
    width: width * 0.41,
    height: width * 0.20, 
    margin: 1,
    borderRadius: 20,
  },
});
