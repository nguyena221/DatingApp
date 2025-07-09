import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    doc,
    setDoc,
  } from "firebase/firestore";
  import { db } from "./FirebaseConfig";
  
  export async function createOrGetChat(currentUid, otherUid) {
    const chatQuery = query(
      collection(db, "chats"),
      where("participants", "in", [
        [currentUid, otherUid],
        [otherUid, currentUid],
      ])
    );
  
    const existing = await getDocs(chatQuery);
  
    if (!existing.empty) {
      return existing.docs[0].id; // Return existing chatId
    }
  
    const newChatRef = await addDoc(collection(db, "chats"), {
      participants: [currentUid, otherUid],
      lastMessage: "",
      lastTimestamp: serverTimestamp(),
    });
  
    return newChatRef.id;
  }
  