// /backend/UserService.js

import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc, 
} from "firebase/firestore";

import {db} from "./FirebaseConfig" 

const usersRef = collection(db, "users");

function sanitizeEmail(email) {
  return email.replace(/\./g, "_");
}

export async function storeTestUser(user) {
  const userID = sanitizeEmail(user.email);
  const userDocRef = doc(db, "users", userID);
  await setDoc(userDocRef, {
    email: user.email,
    password: user.password,
    firstName: user.firstName,
    lastName: user.lastName,
    birthDate: user.birthDate,
  });
}

// ✅ Optional: Store user with auto-generated ID instead of email
export async function storeUserWithAutoID(user) {
  await addDoc(usersRef, {
    email: user.email,
    password: user.password,
    firstName: user.firstName,
    lastName: user.lastName,
    birthDate: user.birthDate,
  });
}

// ✅ Check if a user exists (email-based)
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

// ✅ Real-time listener to a single user document
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