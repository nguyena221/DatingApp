import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../backend/FirebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { useUser } from "../contexts/UserContext"; // ✅ use context hook

export default function MessagesScreen() {
  const { user } = useUser(); // ✅ get current user
  const currentUserId = user?.email;

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    console.log("Mounted MessagesScreen with user:", currentUserId);
    if (!currentUserId) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUserId),
      orderBy("lastTimeStamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chatData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChats(chatData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error in MessagesScreen:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  const renderChatItem = ({ item }) => {
    const otherUserId = item.participants.find((id) => id !== currentUserId);

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          navigation.navigate("ChatScreen", {
            chatId: item.id,
            otherUserId,
          })
        }
      >
        <Text style={styles.chatName}>Chat with: {otherUserId}</Text>
        <Text style={styles.chatPreview}>
          {item.lastMessage || "No messages yet."}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading messages...</Text>
      </SafeAreaView>
    );
  }

  if (chats.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>No conversations yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  chatName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  chatPreview: {
    color: "#666",
    marginTop: 4,
  },
});
