import React from "react";
import { View, StyleSheet} from "react-native";

export default function DailyQuiz() {
  return <View style={styles.container}></View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e6edfc',
    width: '100%',
    aspectRatio: 1,
    margin: 1,
    borderRadius: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
});
