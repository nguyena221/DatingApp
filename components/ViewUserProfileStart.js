import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { calculateAge } from "../backend/UserService";

const { height } = Dimensions.get("window");

export default function ViewUserProfileStart({ userData, scrollY, navigation }) {
  const [bgColor, setBgColor] = useState("#e3f2fd");
  const [photoUrl, setPhotoUrl] = useState("");
  const [selectedBanners, setSelectedBanners] = useState([]);
  const [userName, setUserName] = useState("Loading Name...");
  const [userAge, setUserAge] = useState("Loading...");

  const exploreMoreOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, height * 0.3],
        outputRange: [1, 0],
        extrapolate: "clamp",
      })
    : 1;

  useEffect(() => {
    if (userData) {
      // Set background color
      setBgColor(userData.profileBackgroundColor || "#e3f2fd");

      // Set profile photo
      if (userData.profilePhotoURL) {
        setPhotoUrl(userData.profilePhotoURL);
      } else {
        // Use placeholder image
        fetch("https://picsum.photos/200/200")
          .then(response => setPhotoUrl(response.url))
          .catch(() => setPhotoUrl(""));
      }

      // Set user name
      if (userData.firstName && userData.lastName) {
        setUserName(`${userData.firstName} ${userData.lastName}`);
      } else {
        setUserName("Anonymous User");
      }

      // Calculate and set age
      if (userData.birthDate) {
        try {
          const age = calculateAge(userData.birthDate);
          if (age && !isNaN(age) && age > 0) {
            setUserAge(age.toString());
          } else {
            setUserAge("N/A");
          }
        } catch (error) {
          console.error("Error calculating age:", error);
          setUserAge("N/A");
        }
      } else {
        setUserAge("N/A");
      }

      // Set selected banners
      if (userData.selectedProfileBanners && userData.selectedProfileBanners.length > 0) {
        setSelectedBanners(userData.selectedProfileBanners);
      } else {
        setSelectedBanners([]);
      }
    }
  }, [userData]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.fullContainer}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBackPress}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <StatusBar
        backgroundColor={bgColor}
        barStyle="dark-content"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[bgColor, bgColor, "#f8f9fa"]}
          style={styles.container}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
        >
          <View style={styles.photoContainer}>
            <View style={styles.photoFrame}>
              {photoUrl ? (
                <Image
                  source={{ uri: photoUrl }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <View style={styles.loadingText}>
                  <Ionicons name="person" size={60} color="#ccc" />
                </View>
              )}
            </View>
          </View>

          <View style={styles.profileInfoContainer}>
            <View style={styles.profileInfoNameContainer}>
              <Text style={styles.nameText}>{userName}</Text>
              <Text style={styles.ageText}>Age: {userAge}</Text>
            </View>
            <View style={{bottom:20, right: 155}}>
              <Text style={styles.sectionText}>Stats</Text>
            </View>
            <View style={styles.sectionUnderline} />

            {selectedBanners && selectedBanners.length > 0 ? (
              <View style={styles.statsContainer}>
                {selectedBanners.slice(0, 5).map((banner, index) => (
                  <LinearGradient
                    key={banner.id || index}
                    colors={banner.gradient}
                    style={styles.statRow}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text
                      style={
                        banner.textColor === "white"
                          ? styles.statLabel
                          : styles.statLabelDark
                      }
                    >
                      {banner.label}
                    </Text>
                    <Text
                      style={
                        banner.textColor === "white"
                          ? styles.statValue
                          : styles.statValueDark
                      }
                    >
                      {banner.value}
                    </Text>
                  </LinearGradient>
                ))}
              </View>
            ) : (
              <View style={styles.noQuizzesContainer}>
                <Text style={styles.noQuizzesEmoji}>🎯</Text>
                <Text style={styles.noQuizzesTitle}>
                  No Quizzes Completed Yet
                </Text>
                <Text style={styles.noQuizzesSubtext}>
                  This user has yet to take any quizzes
                </Text>
                <Text style={styles.noQuizzesHint}>
                  They haven't taken personality and lifestyle quizzes yet!
                </Text>
              </View>
            )}

            {scrollY ? (
              <Animated.View
                style={[
                  styles.exploreMoreContainer,
                  { opacity: exploreMoreOpacity },
                ]}
              >
                <Text style={styles.exploreMoreArrow}>↑</Text>
                <Text style={styles.exploreMoreText}>
                  Swipe up to explore more
                </Text>
              </Animated.View>
            ) : (
              <View style={styles.exploreMoreContainer}>
                <Text style={styles.exploreMoreArrow}>↑</Text>
                <Text style={styles.exploreMoreText}>
                  Swipe up to explore more
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    position: "relative",
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoContainer: {
    height: 200,
    width: "100%",
    alignItems: "center",
    paddingTop: 20,
  },
  photoFrame: {
    width: 170,
    height: 170,
    borderRadius: 100,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#ddd",
  },
  loadingText: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  profileInfoContainer: {
    flex: 1,
    marginTop: 23,
  },
  profileInfoNameContainer: {
    height: 100,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  ageText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  sectionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginVertical: 16,
    opacity: 0.5,
  },
  sectionUnderline: {
    height: 2,
    backgroundColor: "rgba(128, 128, 128, 0.4)",
    width: "90%",
    alignSelf: "center",
    marginBottom: 16,
    bottom: 32
  },
  statsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    bottom: 40
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  statLabelDark: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  statValueDark: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  noQuizzesContainer: {
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    bottom: 25
  },
  noQuizzesEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noQuizzesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  noQuizzesSubtext: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  noQuizzesHint: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  exploreMoreContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exploreMoreArrow: {
    fontSize: 20,
    color: "#666",
    marginBottom: 2,
    fontWeight: "bold",
  },
  exploreMoreText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});