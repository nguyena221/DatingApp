//import { database } from "./FirebaseConfig";
//import { ref, set, get, child, onValue } from "firebase/database";
// UserService.js
import { db } from "./FirebaseConfig";

import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

function sanitizeEmail(email) {
  return email.replace(/\./g, "_");
}

export async function storeTestUser(user) {
  const userID = sanitizeEmail(user.email);
  await setDoc(doc(db, "users", userID), {
    email: user.email,
    password: user.password,
    firstName: user.firstName,
    lastName: user.lastName,
    birthDate: user.birthDate,
  });
}

export async function checkTestUser(email, password) {
  const userID = sanitizeEmail(email);
  const docRef = doc(db, "users", userID);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return { success: false, message: "User not found" };
  }

  const data = docSnap.data();
  if (data.password === password) {
    return { success: true, message: "Login success!" };
  } else {
    return { success: false, message: "Incorrect password" };
  }
}

export function listenToTestUser(email, callback) {
  const userID = sanitizeEmail(email);
  const docRef = doc(db, "users", userID);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback(null);
    }
  });
}