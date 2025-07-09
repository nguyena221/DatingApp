import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
  } from "firebase/firestore";
  import { db } from "./FirebaseConfig";
  
  export async function sendMessage(chatId, senderId, receiverId, text) {
    const messageRef = collection(db, "chats", chatId, "messages");
  
    await addDoc(messageRef, {
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      isRead: false,
    });
  
    // Update chat preview
    const chatDocRef = doc(db, "chats", chatId);
    await updateDoc(chatDocRef, {
      lastMessage: text,
      lastTimestamp: serverTimestamp(),
    });
  }
  