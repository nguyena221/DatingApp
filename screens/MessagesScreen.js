import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../backend/FirebaseConfig";

// Utility to darken a hex color
const darkenHexColor = (hex, factor = 0.8) => {
  const f = parseInt(hex.slice(1), 16);
  const r = Math.floor(((f >> 16) & 255) * factor);
  const g = Math.floor(((f >> 8) & 255) * factor);
  const b = Math.floor((f & 255) * factor);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

const confirmDeleteChat = async (chatId) => {
  Alert.alert(
    "Delete Chat",
    "Are you sure you want to delete this conversation?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("🔨 Deleting chat with ID:", chatId);
            await deleteDoc(doc(db, "chats", chatId));
            console.log("✅ Chat successfully deleted");

            // Temporary feedback:
            Alert.alert("Chat Deleted", "This chat has been removed from Firestore.");
          } catch (error) {
            console.error("❌ Error deleting chat:", error);
            Alert.alert("Delete Failed", "Could not delete chat. Check console for error.");
          }
        },
      },
    ]
  );
};

export default function MessagesScreen() {
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      const email = await AsyncStorage.getItem("currentUserEmail");
      if (email) setCurrentUserEmail(email);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!currentUserEmail) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUserEmail),
      orderBy("lastTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const chat = { id: docSnap.id, ...docSnap.data() };
          const otherUser = chat.participants.find(
            (p) => p !== currentUserEmail
          );

          let displayName = otherUser;
          let profilePhoto = null;
          let backgroundColor = "#ffffff";

          try {
            const userDoc = await getDoc(
              doc(db, "users", otherUser.replace(/\./g, "_"))
            );
            if (userDoc.exists()) {
              const userData = userDoc.data();
              displayName = `${userData.firstName || ""} ${
                userData.lastName || ""
              }`.trim();
              profilePhoto = userData.profilePhotoURL || null;
              backgroundColor = userData.profileBackgroundColor || "#ffffff";
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
          }

          return {
            ...chat,
            otherUserEmail: otherUser,
            displayName,
            profilePhoto,
            backgroundColor,
            darkerBackgroundColor: darkenHexColor(backgroundColor),
          };
        })
      );
      setChats(chatData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserEmail]);

  const renderItem = ({ item }) => {
    return (
      <View style={{ position: "relative" }}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ChatRoom", {
              chatId: item.id,
              otherUser: item.otherUserEmail,
              currentUserEmail,
            })
          }
        >
          <LinearGradient
            colors={[item.backgroundColor, item.darkerBackgroundColor]}
            style={styles.chatCard}
          >
            <View style={styles.chatRow}>
              {item.profilePhoto ? (
                <Image
                  source={{ uri: item.profilePhoto }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.initials}>
                    {item.displayName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "?"}
                  </Text>
                </View>
              )}
              <View style={styles.chatText}>
                <Text style={styles.chatName}>{item.displayName}</Text>
                <Text style={styles.chatMessage} numberOfLines={1}>
                  {item.lastMessage || "No messages yet"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => confirmDeleteChat(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 70,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2c3e50",
    paddingBottom: 30,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 20,
  },
  chatCard: {
    borderRadius: 35,
    padding: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontSize: 20,
    color: "#555",
    fontWeight: "600",
  },
  chatText: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  chatMessage: {
    fontSize: 14,
    color: "#555",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    marginLeft: 10,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#ff4d4f",
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
