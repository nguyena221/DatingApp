import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc, 
} from "firebase/firestore";
import {db} from "./FirebaseConfig" 
import { updateDoc } from "firebase/firestore";
import { storage } from "./FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


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

export async function storePersonalityData(email, personalityData) {
  try {
    const userID = sanitizeEmail(email);
    const userDocRef = doc(db, "users", userID);
    
    await updateDoc(userDocRef, {
      personalityData: personalityData
    });
    
    console.log("Personality data stored successfully");
    return { success: true, message: "Personality data saved!" };
  } catch (error) {
    console.error("Error storing personality data:", error);
    return { success: false, message: "Failed to save personality data" };
  }
}

// Optional: Add this function to get user data including personality
export async function getUserWithPersonality(email) {
  try {
    const userID = sanitizeEmail(email);
    const docRef = doc(db, "users", userID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, message: "User not found" };
    }

    const userData = docSnap.data();
    return { 
      success: true, 
      user: userData,
      hasPersonalityData: !!userData.personalityData,
      hasLifestyleData: !!userData.personalityLifestyleData
    };
  } catch (error) {
    console.error("Error getting user data:", error);
    return { success: false, message: "Failed to get user data" };
  }
}

export async function storeLifestyleData(email, lifestyleData) {
  try {
    const userID = sanitizeEmail(email);
    const userDocRef = doc(db, "users", userID);
    
    await updateDoc(userDocRef, {
      personalityLifestyleData: lifestyleData
    });
    
    console.log("Lifestyle data stored successfully");
    return { success: true, message: "Lifestyle data saved!" };
  } catch (error) {
    console.error("Error storing lifestyle data:", error);
    return { success: false, message: "Failed to save lifestyle data" };
  }
}

export async function storeSelectedBanners(email, selectedBanners) {
  try {
    const userID = sanitizeEmail(email);
    const userDocRef = doc(db, "users", userID);
    
    await updateDoc(userDocRef, {
      selectedProfileBanners: selectedBanners
    });
    
    console.log("Selected banners stored successfully");
    return { success: true, message: "Profile banners saved!" };
  } catch (error) {
    console.error("Error storing selected banners:", error);
    return { success: false, message: "Failed to save profile banners" };
  }
}

export async function uploadProfilePhoto(email, imageUri) {
  try {
    const userID = sanitizeEmail(email);
    
    // Convert image to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Create reference to storage location
    const imageRef = ref(storage, `profile_photos/${userID}.jpg`);
    
    // Upload the image
    await uploadBytes(imageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(imageRef);
    
    // Update user document with photo URL
    const userDocRef = doc(db, "users", userID);
    await updateDoc(userDocRef, {
      profilePhotoURL: downloadURL
    });
    
    console.log("Profile photo uploaded successfully");
    return { success: true, photoURL: downloadURL, message: "Photo uploaded!" };
  } catch (error) {
    console.error("Error uploading photo:", error);
    return { success: false, message: "Failed to upload photo" };
  }
}

export async function storeProfileBackgroundColor(email, color) {
  try {
    const userID = sanitizeEmail(email);
    const userDocRef = doc(db, "users", userID);
    
    await updateDoc(userDocRef, {
      profileBackgroundColor: color
    });
    
    console.log("Background color stored successfully");
    return { success: true, message: "Background color saved!" };
  } catch (error) {
    console.error("Error storing background color:", error);
    return { success: false, message: "Failed to save background color" };
  }
}