import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDVSZvF7_c1W1yGMflin8gQnQYoMgS2qEY",
  authDomain: "datingapp-4720-ae8d4.firebaseapp.com",
  projectId: "datingapp-4720-ae8d4",
  storageBucket: "datingapp-4720-ae8d4.firebasestorage.app",
  messagingSenderId: "507793465070",
  appId: "1:507793465070:web:2e27082c67bbc6cb859dff",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export {database}
