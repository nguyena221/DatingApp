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
  getDocs,
  limit,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../backend/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const darkenHexColor = (hex, factor = 0.8) => {
  const f = parseInt(hex.slice(1), 16);
  const r = Math.floor(((f >> 16) & 255) * factor);
  const g = Math.floor(((f >> 8) & 255) * factor);
  const b = Math.floor((f & 255) * factor);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
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
      orderBy("lastTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rawChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const visibleChats = rawChats.filter(chat => chat.visibility?.[currentUserEmail]);

      const chatData = await Promise.all(
        visibleChats.map(async (chat) => {
          const chatId = chat.id;

          const messagesRef = collection(db, "chats", chatId, "messages");
          const messagesQuery = query(
            messagesRef,
            orderBy("timestamp", "desc"),
            limit(1)
          );

          let lastMessage = "No Messages Available";
          let lastSender = "";

          try {
            const messageSnapPromise = new Promise((resolve) => {
              const unsubscribeMessage = onSnapshot(
                messagesQuery,
                (messageSnap) => {
                  let msg = "No Messages Available";
                  let sender = "";

                  if (!messageSnap.empty) {
                    const messageData = messageSnap.docs[0].data();
                    msg = messageData.text || "No Messages Available";
                    sender = messageData.sender || "";
                  }

                  unsubscribeMessage();
                  resolve({ msg, sender });
                },
                (error) => {
                  console.error("Error fetching last message in real-time:", error);
                  resolve({ msg: "No Messages Available", sender: "" });
                }
              );
            });

            const { msg, sender } = await messageSnapPromise;
            lastMessage = msg;
            lastSender = sender;
          } catch (err) {
            console.error("Error fetching last message:", err);
          }

          const otherUser = chat.participants.find((p) => p !== currentUserEmail);

          let displayName = otherUser;
          let profilePhoto = null;
          let backgroundColor = "#ffffff";

          try {
            const userDoc = await getDoc(
              doc(db, "users", otherUser.replace(/\./g, "_"))
            );
            if (userDoc.exists()) {
              const userData = userDoc.data();
              displayName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
              profilePhoto = userData.profilePhotoURL || null;
              backgroundColor = userData.profileBackgroundColor || "#ffffff";
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
          }

          const prefix =
            lastSender === currentUserEmail
              ? "You: "
              : lastSender
              ? `${displayName.split(" ")[0]}: `
              : "";

          return {
            ...chat,
            otherUserEmail: otherUser,
            displayName,
            profilePhoto,
            backgroundColor,
            darkerBackgroundColor: darkenHexColor(backgroundColor),
            lastMessage: prefix + lastMessage,
          };
        })
      );

      console.log("📡 Updated chat list:", chatData);
      setChats(chatData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserEmail]);

  const confirmDeleteChat = (chatId) => {
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
              setLoading(true);
              const chatRef = doc(db, "chats", chatId);
              const chatSnap = await getDoc(chatRef);
              if (chatSnap.exists()) {
                const data = chatSnap.data();
                const newVisibility = { ...data.visibility, [currentUserEmail]: false };

                await updateDoc(chatRef, {
                  visibility: newVisibility,
                });

                // Check if both users have hidden the chat
                const allHidden = Object.values(newVisibility).every((v) => v === false);
                if (allHidden) {
                  const messagesRef = collection(db, "chats", chatId, "messages");
                  const messagesSnap = await getDocs(messagesRef);
                  const batch = writeBatch(db);
                  messagesSnap.forEach((doc) => batch.delete(doc.ref));
                  batch.delete(chatRef);
                  await batch.commit();
                }
              }
            } catch (error) {
              console.error("❌ Error hiding/deleting chat:", error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
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
              <Image source={{ uri: item.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.initials}>
                  {item.displayName?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
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
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

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
    borderRadius: 20,
    color: "#000",
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
