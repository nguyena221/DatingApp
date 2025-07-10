// ... all your imports remain unchanged
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../backend/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";

export default function ChatRoom({ route }) {
  const { chatId, otherUser, currentUserEmail } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [bgColor, setBgColor] = useState("#f8f9fa");
  const [userData, setUserData] = useState({});
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    const fetchColorAndUser = async () => {
      try {
        const safeEmail = otherUser.replace(/\./g, "_");
        const userDoc = await getDoc(doc(db, "users", safeEmail));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          if (data.profileBackgroundColor) {
            setBgColor(data.profileBackgroundColor);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchColorAndUser();
  }, [otherUser]);

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: input.trim(),
        sender: currentUserEmail,
        timestamp: serverTimestamp(),
      });
      console.log("✅ Message saved successfully!");
      setInput("");
    } catch (err) {
      console.error("❌ Failed to send message:", err);
    }
  };  

  const renderHeader = () => {
    const initials =
      (userData.firstName?.[0] || "") + (userData.lastName?.[0] || "");

    return (
      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          {userData.profilePhoto ? (
            <Image source={{ uri: userData.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.initials}>
                {initials.toUpperCase() || "?"}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.displayName}>
              {userData.firstName} {userData.lastName}
            </Text>
            <Text style={styles.email}>{otherUser}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <LinearGradient colors={[bgColor, "#f8f9fa"]} style={styles.gradient}>
        {renderHeader()}
        <View style={styles.inner}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.sender === currentUserEmail
                    ? styles.myMessage
                    : styles.theirMessage,
                ]}
              >
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            )}
            contentContainerStyle={styles.messagesList}
          />

          <View style={[styles.inputRow, { paddingBottom: insets.bottom + 6 }]}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
            />
            <TouchableOpacity onPress={sendMessage}>
              <LinearGradient
                colors={[bgColor, bgColor || "#667eea", "#667eea"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButtonGradient}
              >
                <Text style={styles.sendText}>Send</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: "transparent",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#bbb",
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "#fff",
    fontWeight: "bold",
  },
  displayName: {
    fontWeight: "600",
    fontSize: 16,
  },
  email: {
    fontSize: 12,
    color: "#555",
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  messagesList: {
    padding: 12,
    flexGrow: 1,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: "75%",
  },
  myMessage: {
    backgroundColor: "#f8f9fa",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#f1f1f1",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  inputRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 8,
  },
  sendButtonGradient: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
  },
  sendText: {
    color: "#444", 
    fontWeight: "bold",
  },
});
