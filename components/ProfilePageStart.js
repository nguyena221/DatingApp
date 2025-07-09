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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserWithPersonality, calculateAge } from "../backend/UserService";
import { useUser } from "../contexts/UserContext";
import LogoutButton from "../components/LogoutButton";

const { height } = Dimensions.get("window");

export default function ProfilePageStart({ scrollY }) {
  const [bgColor, setBgColor] = useState("#e3f2fd");
  const [photoUrl, setPhotoUrl] = useState("");
  const [selectedBanners, setSelectedBanners] = useState([]);
  const [userName, setUserName] = useState("Loading Name...");
  const [userAge, setUserAge] = useState("Loading...");
  const navigation = useNavigation();
  const { currentUser } = useUser();

  const exploreMoreOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, height * 0.3],
        outputRange: [1, 0],
        extrapolate: "clamp",
      })
    : 1;

  const getProfilePhoto = async () => {
    try {
      const userEmail = "test2@example.com"; // Replace with actual user email
      const result = await getUserWithPersonality(userEmail);

      if (result.success && result.user && result.user.profilePhotoURL) {
        return result.user.profilePhotoURL;
      } else {
        let response = await fetch("https://picsum.photos/200/20");
        return response.url;
      }
    } catch (error) {
      console.error("Error loading profile photo:", error);
      let response = await fetch("https://picsum.photos/200/20");
      return response.url;
    }
  };

  useEffect(() => {
    const loadPhoto = async () => {
      const url = await getProfilePhoto();
      setPhotoUrl(url);
    };
    loadPhoto();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
       try {
        console.log("🔍 DEBUG: currentUser from context:", currentUser);
        console.log("🔍 DEBUG: currentUser?.email:", currentUser?.email);
        
        const userEmail = currentUser?.email;
        if (!userEmail) {
          console.log("❌ No user logged in");
          return;
        }
        
        console.log("✅ Loading data for user:", userEmail);
          const result = await getUserWithPersonality(userEmail);

          if (result.success && result.user) {
            if (result.user.firstName && result.user.lastName) {
              setUserName(`${result.user.firstName} ${result.user.lastName}`);
            }

            if (result.user.birthDate) {
              console.log("Birth date from database:", result.user.birthDate);
              try {
                const age = calculateAge(result.user.birthDate);
                console.log("Calculated age:", age);

                if (age && !isNaN(age) && age > 0) {
                  setUserAge(age.toString());
                } else {
                  console.warn("Invalid age calculated:", age);
                  setUserAge("N/A");
                }
              } catch (ageError) {
                console.error("Error calculating age:", ageError);
                setUserAge("N/A");
              }
            } else {
              console.log("No birth date found in user data");
              setUserAge("N/A");
            }

            if (result.user.profileBackgroundColor) {
              setBgColor(result.user.profileBackgroundColor);
              await AsyncStorage.setItem(
                "profileBackgroundColor",
                result.user.profileBackgroundColor
              );
            } else {
              const savedColor = await AsyncStorage.getItem(
                "profileBackgroundColor"
              );
              if (savedColor) {
                setBgColor(savedColor);
              }
            }

            if (
              result.user.selectedProfileBanners &&
              result.user.selectedProfileBanners.length > 0
            ) {
              setSelectedBanners(result.user.selectedProfileBanners);
            } else {
              setSelectedBanners([]);
            }
          } else {
            const savedColor = await AsyncStorage.getItem(
              "profileBackgroundColor"
            );
            if (savedColor) {
              setBgColor(savedColor);
            }
            setUserAge("N/A");
            setSelectedBanners([]);
          }
        } catch (e) {
          console.error("Failed to load user data", e);
          try {
            const savedColor = await AsyncStorage.getItem(
              "profileBackgroundColor"
            );
            if (savedColor) {
              setBgColor(savedColor);
            }
          } catch (asyncError) {
            console.error("Failed to load from AsyncStorage", asyncError);
          }
          setUserAge("N/A");
          setSelectedBanners([]);
        }
      };
      loadUserData();
    }, [])
  );

  const handleEditPress = () => {
    navigation.navigate("EditProfile");
  };

  return (
    <View style={styles.fullContainer}>
      <LogoutButton overrideTop={50} />
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
          <TouchableOpacity
            style={styles.editProfileContainer}
            onPress={handleEditPress}
          >
            <Text style={styles.editProfileText}>Edit</Text>
          </TouchableOpacity>

          <View style={styles.photoContainer}>
            <View style={styles.photoFrame}>
              {photoUrl ? (
                <Image
                  source={{ uri: photoUrl }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <View style={styles.loadingText}>
                  <Text>Loading...</Text>
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
                  Take personality and lifestyle quizzes to show off your unique
                  traits!
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
    position: "relative", // ✅ Allows absolute positioning for LogoutButton
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
    fontFamily: "Georgia-Italic",
  },
  editProfileContainer: {
    alignItems: "center",
    height: 35,
    position: "absolute",
    alignSelf: "flex-end", // pushes it to the right side
    marginRight: 10,
    top: 0,
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.4)",
    borderRadius: 18,
    paddingVertical: 0,
    paddingHorizontal: 16,
    zIndex: 10,
    justifyContent: "center", // vertical alignment
    alignItems: "center",
  },
  editProfileText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.9,
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
    textAlign: "center", // ✅ centers the text
    marginVertical: 16, // optional spacing
    opacity: 0.5,
  },
  sectionUnderline: {
    height: 2,
    backgroundColor: "rgba(128, 128, 128, 0.4)", // or any color you want
    width: "90%", // or "100%" for full screen
    alignSelf: "center", // centers it horizontally
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
