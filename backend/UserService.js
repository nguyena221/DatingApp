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

export async function storeUser(user) {
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
