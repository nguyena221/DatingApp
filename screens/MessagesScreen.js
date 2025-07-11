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
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  writeBatch,
  limit,
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

    const q = query(collection(db, "chats"), orderBy("lastTimestamp", "desc"));

    const unsubscribeChats = onSnapshot(q, async (snapshot) => {
      const chatSnapshots = snapshot.docs.filter(
        (doc) => doc.data().visibility?.[currentUserEmail]
      );

      if (chatSnapshots.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      const unsubscribers = [];

      await Promise.all(
        chatSnapshots.map(async (chatDoc) => {
          const chatData = chatDoc.data();
          const chatId = chatDoc.id;
          const otherUser = chatData.participants.find(
            (p) => p !== currentUserEmail
          );

          let displayName = otherUser;
          let profilePhoto = null;
          let backgroundColor = "#ffffff";
          let unreadCount = chatData.unreadCount?.[currentUserEmail] || 0;

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
            console.error("Error fetching user info:", err);
          }

          const messagesRef = collection(db, "chats", chatId, "messages");
          const latestMessageQuery = query(
            messagesRef,
            orderBy("timestamp", "desc"),
            limit(1)
          );

          const messageUnsub = onSnapshot(latestMessageQuery, (msgSnap) => {
            let lastMessageText = "No messages yet";
            let lastMessageSender = "";
          
            if (!msgSnap.empty) {
              const message = msgSnap.docs[0].data();
              lastMessageText = message.text || "";
              lastMessageSender = message.sender;
            }
          
            let prefix = "";
            if (lastMessageSender === currentUserEmail) {
              prefix = "You: ";
            } else if (lastMessageSender) {
              const firstName = displayName.split(" ")[0];
              prefix = `${firstName}: `;
            }
          
            // ✅ Use chatData.visibility instead of trying to get it again
            const isVisible = chatData.visibility?.[currentUserEmail];
            if (!isVisible) return;
          
            setChats((prev) => {
              const updated = prev.filter((c) => c.id !== chatId);
              return [
                {
                  id: chatId,
                  otherUserEmail: otherUser,
                  displayName,
                  profilePhoto,
                  backgroundColor,
                  darkerBackgroundColor: darkenHexColor(backgroundColor),
                  lastMessage: prefix + lastMessageText,
                  unreadCount,
                },
                ...updated,
              ];
            });
          
            setLoading(false);
          });          

          unsubscribers.push(messageUnsub);
        })
      );

      return () => unsubscribers.forEach((unsub) => unsub());
    });

    return () => unsubscribeChats();
  }, [currentUserEmail]);

  const confirmDeleteChat = (chatId) => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this conversation?", [
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
              const newVisibility = {
                ...data.visibility,
                [currentUserEmail]: false,
              };
  
              await updateDoc(chatRef, {
                visibility: newVisibility,
              });
  
              // 🟢 Remove from UI right away
              setChats((prevChats) => prevChats.filter((c) => c.id !== chatId));
  
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
    ]);
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

            {item.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            )}

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
      {chats.length === 0 && (
        <Text style={{ textAlign: "center", color: "#777", marginTop: 20 }}>
          You have no messages yet.
        </Text>
      )}
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
    position: "relative",
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
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
  },
  badge: {
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: "absolute",
    top: -4,
    right: 36,
    zIndex: 1,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
