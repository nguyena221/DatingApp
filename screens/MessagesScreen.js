import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
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
} from "firebase/firestore";
import { db } from "../backend/FirebaseConfig";

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

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
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
                displayName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
                profilePhoto = userData.profilePhotoURL || null;
                backgroundColor = userData.profileBackgroundColor || "#ffffff";
              }
            } catch (err) {
              console.error("❌ Error getting user data:", err);
            }

            return {
              ...chat,
              otherUserEmail: otherUser,
              displayName,
              profilePhoto,
              backgroundColor,
            };
          })
        );

        setChats(chatData);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error fetching chats:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserEmail]);

  const renderItem = ({ item }) => {
    const timestamp = item.lastTimestamp?.toDate?.().toLocaleString() || "";
    const unread = item.unreadCount?.[currentUserEmail] || 0;

    return (
      <TouchableOpacity
        style={[styles.chatCard, { backgroundColor: item.backgroundColor }]}
        onPress={() =>
          navigation.navigate("ChatRoom", {
            chatId: item.id,
            otherUser: item.otherUserEmail,
            currentUserEmail,
          })
        }
      >
        <View style={styles.chatRow}>
          {item.profilePhoto ? (
            <Image source={{ uri: item.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.initials}>
                {item.displayName?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
          <View style={styles.chatText}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName}>{item.displayName}</Text>
              <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
            <View style={styles.chatFooter}>
              <Text style={styles.chatMessage} numberOfLines={1}>
                {item.lastMessage || "No messages yet"}
              </Text>
              {unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{unread}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      {chats.length === 0 ? (
        <Text style={styles.emptyText}>No conversations yet</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
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
    borderRadius: 16,
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
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatMessage: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 40,
  },
});
