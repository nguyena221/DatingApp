import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LogoutButton from "../components/LogoutButton";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../backend/FirebaseConfig";
import { calculateAge } from "../backend/UserService";
import { useUser } from "../contexts/UserContext";
import SettingsPage from "./SettingsPage";
import ViewUserProfile from "./ViewUserProfile";

const DiscoverStack = createNativeStackNavigator();

function DiscoverMainScreen({ navigation }) {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profileQueue, setProfileQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser();

  const loadProfiles = async () => {
    try {
      const usersCollection = collection(db, "users");
      const snapshot = await getDocs(usersCollection);
      const profiles = [];

      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email !== currentUser?.email) {
          profiles.push({
            id: doc.id,
            ...userData,
          });
        }
      });

      const shuffledProfiles = profiles.sort(() => Math.random() - 0.5);
      setProfileQueue(shuffledProfiles);

      if (shuffledProfiles.length > 0) {
        setCurrentProfile(shuffledProfiles[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading profiles:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [currentUser]);

  const nextProfile = () => {
    if (profileQueue.length > 1) {
      const newQueue = profileQueue.slice(1);
      setProfileQueue(newQueue);
      setCurrentProfile(newQueue[0]);
    } else {
      loadProfiles();
    }
  };

  const handleProfilePress = () => {
    if (currentProfile) {
      navigation.navigate("ViewUserProfile", {
        userData: currentProfile
      });
    }
  };

  const renderProfileCard = () => {
    if (!currentProfile) return null;

    try {
      const age = currentProfile.birthDate
        ? calculateAge(currentProfile.birthDate)
        : "N/A";
      const name =
        currentProfile.firstName && currentProfile.lastName
          ? `${currentProfile.firstName} ${currentProfile.lastName}`
          : "Anonymous User";

      const bgColor = currentProfile.profileBackgroundColor || "#e3f2fd";
      const banners = currentProfile.selectedProfileBanners || [];

      return (
        <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.9}>
          <LinearGradient
            colors={[bgColor, "#ffffff"]}
            style={styles.profileCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.photoContainer}>
              <View style={styles.photoFrame}>
                {currentProfile.profilePhotoURL ? (
                  <Image
                    source={{ uri: currentProfile.profilePhotoURL }}
                    style={styles.profilePhoto}
                  />
                ) : (
                  <View style={styles.placeholderPhoto}>
                    <Ionicons name="person" size={60} color="#ccc" />
                  </View>
                )}
              </View>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.nameText}>{name}</Text>
              <Text style={styles.ageText}>{age}</Text>
            </View>

            <View style={styles.bannersContainer}>
              {banners && banners.length > 0 ? (
                banners.slice(0, 3).map((banner, index) => (
                  <LinearGradient
                    key={banner.id || index}
                    colors={banner.gradient || ["#f0f0f0", "#e0e0e0"]}
                    style={styles.bannerRow}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text
                      style={
                        banner.textColor === "white"
                          ? styles.bannerLabel
                          : styles.bannerLabelDark
                      }
                    >
                      {banner?.label || "Unknown"}
                    </Text>
                    <Text
                      style={
                        banner.textColor === "white"
                          ? styles.bannerValue
                          : styles.bannerValueDark
                      }
                    >
                      {banner?.value || "N/A"}
                    </Text>
                  </LinearGradient>
                ))
              ) : (
                <View style={styles.noQuizzesContainer}>
                  <Text style={styles.noQuizzesEmoji}>🎯</Text>
                  <Text style={styles.noQuizzesText}>
                    This user hasn't completed any quizzes yet
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.viewProfileButton} onPress={handleProfilePress}>
                <Text style={styles.viewProfileButtonText}>View Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.nextButton} onPress={nextProfile}>
                <Text style={styles.nextButtonText}>Next →</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error("Error rendering profile:", error);
      return (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>Error loading profile</Text>
          <TouchableOpacity style={styles.nextButton} onPress={loadProfiles}>
            <Text style={styles.nextButtonText}>Reload</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
        <View style={styles.topBar}>
          <Ionicons name="settings-outline" size={25} color="black" />
        </View>
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Text style={styles.text}>Discover</Text>
        <Text style={styles.subtitle}>New potential partners everyday!</Text>
      </View>

      <View style={styles.cardContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profiles...</Text>
          </View>
        ) : currentProfile ? (
          renderProfileCard()
        ) : (
          <View style={styles.noProfilesContainer}>
            <Text style={styles.noProfilesText}>No profiles found!</Text>
            <TouchableOpacity style={styles.nextButton} onPress={loadProfiles}>
              <Text style={styles.nextButtonText}>Reload</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function DiscoverPage() {
  return (
    <DiscoverStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <DiscoverStack.Screen
        name="DiscoverMain"
        component={DiscoverMainScreen}
      />
      <DiscoverStack.Screen
        name="Settings"
        component={SettingsPage}
        options={{
          headerShown: true,
          headerTitle: "Settings",
          headerBackTitle: "Back",
          presentation: "modal",
        }}
      />
      <DiscoverStack.Screen
        name="ViewUserProfile"
        component={ViewUserProfile}
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
    </DiscoverStack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  topBar: {
    paddingTop: 10,
    alignItems: "flex-end",
    height: 50,
    position: "absolute",
    right: 20,
  },
  headerContainer: {
    paddingTop: 10,
    height: 60,
    alignItems: "center",
  },
  text: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 22,
    paddingBottom: 10,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  profileCard: {
    height: 600,
    width: 300,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    padding: 20,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  photoFrame: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
  },
  placeholderPhoto: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 20,
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
  },
  bannersContainer: {
    flex: 1,
    gap: 10,
  },
  bannerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  bannerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  bannerValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  bannerLabelDark: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  bannerValueDark: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  noQuizzesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 20,
  },
  noQuizzesEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  noQuizzesText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 15,
    paddingHorizontal: 5,
  },
  viewProfileButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    minHeight: 50,
  },
  viewProfileButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  nextButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    minHeight: 50,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  noProfilesContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  noProfilesText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  errorCard: {
    height: 550,
    width: 300,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
});