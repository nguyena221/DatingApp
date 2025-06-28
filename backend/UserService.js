import { database } from "./FirebaseConfig";
import { ref, set, get, child, onValue } from "firebase/database";

export function storeTestUser(user) {
  const userID = user.email.replace(/\./g, "_");
  return set(ref(database, "users/" + userID), {
    email: user.email,
    password: user.password,
    firstName: user.firstName,
    lastName: user.lastName,
    birthDate: user.birthDate,
  });
}

export async function checkTestUser(email, password) {
  const userID = email.replace(/\./g, "_");
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, `users/${userID}`));
  if (!snapshot.exists()) return { success: false, message: "User not found" };

  const data = snapshot.val();
  if (data.password === password) {
    return { success: true, message: "Login success!" };
  } else {
    return { success: false, message: "Incorrect password" };
  }
}

export function listenToTestUser(email, callback) {
  const userID = email.replace(/\./g, "_");
  const userRef = ref(database, `users/${userID}`);
  onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    callback(data ?? null);
  });
}
