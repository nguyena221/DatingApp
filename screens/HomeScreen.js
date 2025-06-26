import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import EventBox from "../components/EventBox";
import DailyQuiz from "../components/DailyQuiz";

export default function HomeScreen() {
  let helloName = "John"; // we can change this later to work dynamically

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ccddff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.helloText}>
          Hello, <Text style={styles.nameText}>{helloName}</Text>!
        </Text>

        <View style={styles.events}>
          <Text style={styles.subText}>Here are some upcoming events:</Text>
          <EventBox />
        </View>

        <View style={styles.dailyQuiz}>
          <Text style={styles.subText}>Take the daily quiz:</Text>
          <DailyQuiz />
        </View>

        <View style={styles.events}>
          <Text style={styles.subText}>We can add some other stat or thing here</Text>
          <EventBox />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    gap: 15,
  },
  helloText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#267f53',
  },
  nameText: {
    color: '#e6c730',
  },
  subText: {
    color: '#267f53',
    paddingVertical: 15,
    fontWeight: 'bold',
    fontSize: 17,
  },
  events: {
    marginBottom: 20,
  },
  dailyQuiz: {
    marginBottom: 20,
  },
});
