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

  const existingDoc = await getDoc(userDocRef);
  if (existingDoc.exists()) {
    throw new Error("Email is already registered.");
  }

  await setDoc(userDocRef, {
    email: user.email,
    password: user.password,
    firstName: user.firstName,
    lastName: user.lastName,
    birthDate: user.birthDate,
    gender: user.gender,
    sexualOrientation: user.sexualOrientation,
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

export function calculateAge(birthDateString) {
  try {
    console.log("Input birth date:", birthDateString);
    
    let birthDate;
    
    if (birthDateString instanceof Date) {
      birthDate = birthDateString;
    } else if (typeof birthDateString === 'string') {
      // Handle MM/DD/YYYY format specifically
      if (birthDateString.includes('/')) {
        const [month, day, year] = birthDateString.split('/');
        // Create date with explicit parameters: new Date(year, month-1, day)
        birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Try standard Date parsing for other formats
        birthDate = new Date(birthDateString);
      }
    } else {
      console.error("Invalid birth date format:", birthDateString);
      return "N/A";
    }
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      console.error("Invalid date created from:", birthDateString);
      return "N/A";
    }
    
    console.log("Parsed birth date:", birthDate);
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    console.log("Calculated age:", age);
    
    // Additional validation
    if (age < 0 || age > 150) {
      console.error("Unrealistic age calculated:", age);
      return "N/A";
    }
    
    return age;
  } catch (error) {
    console.error("Error calculating age:", error);
    return "N/A";
  }
}

// Add this function to your UserService.js

export async function autoGenerateProfileBanners(email) {
  try {
    const userID = sanitizeEmail(email);
    const docRef = doc(db, "users", userID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, message: "User not found" };
    }

    const userData = docSnap.data();
    const personalityData = userData.personalityData;
    const lifestyleData = userData.personalityLifestyleData;

    // Generate banners from quiz data (same logic as EditProfile)
    const banners = [];

    // Personality quiz banners
    if (personalityData) {
      // Always add personality type banner
      banners.push({
        id: 'personality_type',
        label: 'Personality Type',
        value: personalityData.short_description || personalityData.personalityType,
        gradient: ['#667eea', '#764ba2'],
        textColor: 'white'
      });

      // Add dimension banners if available
      if (personalityData.dimensions) {
        banners.push({
          id: 'energy_style',
          label: 'Energy Style',
          value: personalityData.dimensions.energyOrientation,
          gradient: ['#a8edea', '#fed6e3'],
          textColor: '#333'
        });

        banners.push({
          id: 'decision_style',
          label: 'Decision Style',
          value: personalityData.dimensions.decisionMaking,
          gradient: ['#d299c2', '#fef9d7'],
          textColor: '#333'
        });
      }
    }

    // Lifestyle quiz banners - Add ALL available banners
    if (lifestyleData && lifestyleData.preferences) {
      const prefs = lifestyleData.preferences;

      // Add all lifestyle banners
      if (prefs.candy !== undefined) {
        banners.push({
          id: 'candy_choice',
          label: 'Candy Choice',
          value: prefs.candy === 0 ? 'Skittles 🌈' : 'M&Ms 🍫',
          gradient: ['#ffecd2', '#fcb69f'],
          textColor: '#333'
        });
      }

      if (prefs.time_of_day !== undefined) {
        banners.push({
          id: 'time_preference',
          label: 'Time Preference',
          value: prefs.time_of_day === 0 ? 'Morning Person 🌅' : 'Night Owl 🦉',
          gradient: ['#ff9a9e', '#fecfef'],
          textColor: '#333'
        });
      }

      if (prefs.pets !== undefined) {
        banners.push({
          id: 'pet_preference',
          label: 'Pet Preference',
          value: prefs.pets === 0 ? 'Cat Person 🐱' : 'Dog Person 🐶',
          gradient: ['#a8edea', '#fed6e3'],
          textColor: '#333'
        });
      }

      if (prefs.drink !== undefined) {
        banners.push({
          id: 'drink_choice',
          label: 'Drink Choice',
          value: prefs.drink === 0 ? 'Coffee Lover ☕' : 'Tea Enthusiast 🍵',
          gradient: ['#d299c2', '#fef9d7'],
          textColor: '#333'
        });
      }

      if (prefs.home !== undefined) {
        banners.push({
          id: 'home_style',
          label: 'Dream Home',
          value: prefs.home === 0 ? 'Cozy Cottage 🏠' : 'Grand Mansion 🏰',
          gradient: ['#ff9a9e', '#fecfef'],
          textColor: '#333'
        });
      }

      if (prefs.friday_night !== undefined) {
        banners.push({
          id: 'social_style',
          label: 'Social Style',
          value: prefs.friday_night === 0 ? 'Party Starter 🕺' : 'Movie Night 🍿',
          gradient: ['#667eea', '#764ba2'],
          textColor: 'white'
        });
      }

      if (prefs.vacation !== undefined) {
        banners.push({
          id: 'vacation_style',
          label: 'Vacation Style',
          value: prefs.vacation === 0 ? 'Beach Lover 🏖️' : 'Mountain Explorer ⛰️',
          gradient: ['#ffecd2', '#fcb69f'],
          textColor: '#333'
        });
      }

      if (prefs.organization !== undefined) {
        banners.push({
          id: 'organization',
          label: 'Organization',
          value: prefs.organization === 0 ? 'Super Organized ✨' : 'Creative Chaos 🌪️',
          gradient: ['#a8edea', '#fed6e3'],
          textColor: '#333'
        });
      }

      // Add more lifestyle banners to ensure we have enough
      if (prefs.living_location !== undefined) {
        banners.push({
          id: 'living_location',
          label: 'Living Style',
          value: prefs.living_location === 0 ? 'City Life 🏙️' : 'Country Living 🌾',
          gradient: ['#ff9a9e', '#fecfef'],
          textColor: '#333'
        });
      }

      if (prefs.relationships !== undefined) {
        banners.push({
          id: 'relationship_style',
          label: 'Relationship Style',
          value: prefs.relationships === 0 ? 'Open Book 📖' : 'Mysterious 🗝️',
          gradient: ['#d299c2', '#fef9d7'],
          textColor: '#333'
        });
      }

      if (prefs.vibe !== undefined) {
        banners.push({
          id: 'vibe_style',
          label: 'Your Vibe',
          value: prefs.vibe === 0 ? 'Magical Unicorn 🦄' : 'Cool Robot 🤖',
          gradient: ['#a8edea', '#fed6e3'],
          textColor: '#333'
        });
      }

      if (prefs.exercise !== undefined) {
        banners.push({
          id: 'exercise_style',
          label: 'Exercise Style',
          value: prefs.exercise === 0 ? 'Power Runner 🏃‍♀️' : 'Peaceful Walker 🚶‍♀️',
          gradient: ['#ffecd2', '#fcb69f'],
          textColor: '#333'
        });
      }
    }

    console.log(`Generated ${banners.length} banners for user:`, email);

    // Only update if we have banners and user doesn't already have selected banners
    if (banners.length > 0 && (!userData.selectedProfileBanners || userData.selectedProfileBanners.length === 0)) {
      // Ensure we select exactly 5 banners (or all available if less than 5)
      const defaultSelectedBanners = banners.slice(0, Math.min(5, banners.length));
      
      await updateDoc(docRef, {
        selectedProfileBanners: defaultSelectedBanners
      });

      console.log(`Auto-generated ${defaultSelectedBanners.length} profile banners for user:`, email);
      return { success: true, message: "Profile banners auto-generated!", banners: defaultSelectedBanners };
    }

    return { success: true, message: "No banner generation needed" };
  } catch (error) {
    console.error("Error auto-generating banners:", error);
    return { success: false, message: "Failed to auto-generate banners" };
  }
}

export async function storeLocationSettings(email, locationSettings) {
  try {
    const userID = sanitizeEmail(email);
    const userDocRef = doc(db, "users", userID);
    
    await updateDoc(userDocRef, {
      locationSettings: locationSettings
    });
    
    console.log("Location settings stored successfully");
    return { success: true, message: "Location settings saved!" };
  } catch (error) {
    console.error("Error storing location settings:", error);
    return { success: false, message: "Failed to save location settings" };
  }
}

export async function storeSelectedWidgets(email, selectedWidgets) {
  try {
    const userID = sanitizeEmail(email);
    const userDocRef = doc(db, "users", userID);
    
    await updateDoc(userDocRef, {
      selectedWidgets: selectedWidgets // Array of 4 widget IDs
    });
    
    console.log("Selected widgets stored successfully");
    return { success: true, message: "Widget selection saved!" };
  } catch (error) {
    console.error("Error storing selected widgets:", error);
    return { success: false, message: "Failed to save widget selection" };
  }
}

export async function storeWidgetData(email, widgetType, widgetData) {
  try {
    const userID = sanitizeEmail(email);
    const userDocRef = doc(db, "users", userID);
    
    // Store widget data in a nested object structure
    const updateField = `widgetData.${widgetType}`;
    
    await updateDoc(userDocRef, {
      [updateField]: {
        ...widgetData,
        lastUpdated: new Date().toISOString()
      }
    });
    
    console.log(`${widgetType} widget data stored successfully`);
    return { success: true, message: "Widget data saved!" };
  } catch (error) {
    console.error(`Error storing ${widgetType} widget data:`, error);
    return { success: false, message: "Failed to save widget data" };
  }
}

export async function getWidgetData(email, widgetType) {
  try {
    const userID = sanitizeEmail(email);
    const docRef = doc(db, "users", userID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, message: "User not found" };
    }

    const userData = docSnap.data();
    const widgetData = userData.widgetData?.[widgetType];
    
    return { 
      success: true, 
      data: widgetData || null
    };
  } catch (error) {
    console.error(`Error getting ${widgetType} widget data:`, error);
    return { success: false, message: "Failed to get widget data" };
  }
}

// Add these functions to your existing UserService.js

// Helper function to get the correct array name for each widget type
const getWidgetArrayName = (widgetType) => {
  const arrayNames = {
    travel: 'destinations',
    movies: 'movies',
    books: 'books',
    foodie: 'spots',
    tvshows: 'shows',
    fitness: 'goals',
    hobbies: 'skills',
    lifegoals: 'goals',
  };
  return arrayNames[widgetType];
};

// Initialize default widget data for a specific widget type
export async function initializeWidgetData(email, widgetType) {
  try {
    const userID = sanitizeEmail(email);
    const docRef = doc(db, "users", userID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, message: "User not found" };
    }

    const userData = docSnap.data();
    const existingWidgetData = userData.widgetData || {};

    // Don't initialize if data already exists
    if (existingWidgetData[widgetType]) {
      return { success: true, message: "Widget data already exists" };
    }

    const arrayName = getWidgetArrayName(widgetType);
    if (!arrayName) {
      return { success: false, message: "Unknown widget type" };
    }

    // Default data for each widget type
    const defaultData = {
      travel: {
        destinations: [],
        lastUpdated: new Date().toISOString()
      },
      movies: {
        movies: [],
        lastUpdated: new Date().toISOString()
      },
      books: {
        books: [],
        lastUpdated: new Date().toISOString()
      },
      foodie: {
        spots: [],
        lastUpdated: new Date().toISOString()
      },
      tvshows: {
        shows: [],
        lastUpdated: new Date().toISOString()
     },
     fitness: {
        goals: [],
        lastUpdated: new Date().toISOString()
     },
     hobbies: {
        skills: [],
        lastUpdated: new Date().toISOString()
    },
    lifegoals: {
        goals: [],
        lastUpdated: new Date().toISOString()
    },
    };

    const updateField = `widgetData.${widgetType}`;
    await updateDoc(docRef, {
      [updateField]: defaultData[widgetType]
    });

    console.log(`Initialized ${widgetType} widget data`);
    return { success: true, message: "Widget data initialized!" };
  } catch (error) {
    console.error(`Error initializing ${widgetType} widget data:`, error);
    return { success: false, message: "Failed to initialize widget data" };
  }
}

// Add new item to widget
export async function addWidgetItem(email, widgetType, newItem) {
  try {
    const userID = sanitizeEmail(email);
    const docRef = doc(db, "users", userID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, message: "User not found" };
    }

    const userData = docSnap.data();
    let currentWidgetData = userData.widgetData?.[widgetType];

    // Initialize if doesn't exist
    if (!currentWidgetData) {
      await initializeWidgetData(email, widgetType);
      const refreshedDoc = await getDoc(docRef);
      const refreshedData = refreshedDoc.data();
      currentWidgetData = refreshedData.widgetData[widgetType];
    }

    const arrayName = getWidgetArrayName(widgetType);
    const currentItems = currentWidgetData[arrayName] || [];

    // Generate new ID
    const newId = currentItems.length > 0 ? Math.max(...currentItems.map(item => item.id || 0)) + 1 : 1;
    const itemWithId = { ...newItem, id: newId };

    // Add new item
    const updatedItems = [...currentItems, itemWithId];

    const updateField = `widgetData.${widgetType}`;
    await updateDoc(docRef, {
      [updateField]: {
        ...currentWidgetData,
        [arrayName]: updatedItems,
        lastUpdated: new Date().toISOString()
      }
    });

    console.log(`Added new ${widgetType} item successfully`);
    return { success: true, message: "Item added successfully!", newItem: itemWithId };
  } catch (error) {
    console.error(`Error adding ${widgetType} item:`, error);
    return { success: false, message: "Failed to add item" };
  }
}

// Remove item from widget
export async function removeWidgetItem(email, widgetType, itemId) {
  try {
    const userID = sanitizeEmail(email);
    const docRef = doc(db, "users", userID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, message: "User not found" };
    }

    const userData = docSnap.data();
    const currentWidgetData = userData.widgetData?.[widgetType];

    if (!currentWidgetData) {
      return { success: false, message: "Widget data not found" };
    }

    const arrayName = getWidgetArrayName(widgetType);
    const currentItems = currentWidgetData[arrayName] || [];
    const filteredItems = currentItems.filter(item => item.id !== itemId);

    const updateField = `widgetData.${widgetType}`;
    await updateDoc(docRef, {
      [updateField]: {
        ...currentWidgetData,
        [arrayName]: filteredItems,
        lastUpdated: new Date().toISOString()
      }
    });

    console.log(`Removed ${widgetType} item successfully`);
    return { success: true, message: "Item removed successfully!" };
  } catch (error) {
    console.error(`Error removing ${widgetType} item:`, error);
    return { success: false, message: "Failed to remove item" };
  }
}

// Update existing item in widget
export async function updateWidgetItem(email, widgetType, itemId, updatedData) {
  try {
    const userID = sanitizeEmail(email);
    const docRef = doc(db, "users", userID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, message: "User not found" };
    }

    const userData = docSnap.data();
    const currentWidgetData = userData.widgetData?.[widgetType];

    if (!currentWidgetData) {
      return { success: false, message: "Widget data not found" };
    }

    const arrayName = getWidgetArrayName(widgetType);
    const currentItems = currentWidgetData[arrayName] || [];
    const updatedItems = currentItems.map(item =>
      item.id === itemId ? { ...item, ...updatedData } : item
    );

    const updateField = `widgetData.${widgetType}`;
    await updateDoc(docRef, {
      [updateField]: {
        ...currentWidgetData,
        [arrayName]: updatedItems,
        lastUpdated: new Date().toISOString()
      }
    });

    console.log(`Updated ${widgetType} item successfully`);
    return { success: true, message: "Item updated successfully!" };
  } catch (error) {
    console.error(`Error updating ${widgetType} item:`, error);
    return { success: false, message: "Failed to update item" };
  }
}

// Get widget data for current user
export async function getUserWidgetData(email, widgetType) {
  try {
    const userID = sanitizeEmail(email);
    const docRef = doc(db, "users", userID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, message: "User not found" };
    }

    const userData = docSnap.data();
    const widgetData = userData.widgetData?.[widgetType];

    if (!widgetData) {
      // Initialize empty data if doesn't exist
      await initializeWidgetData(email, widgetType);
      return { 
        success: true, 
        data: { 
          [getWidgetArrayName(widgetType)]: [], 
          lastUpdated: new Date().toISOString() 
        } 
      };
    }

    return { 
      success: true, 
      data: widgetData
    };
  } catch (error) {
    console.error(`Error getting ${widgetType} widget data:`, error);
    return { success: false, message: "Failed to get widget data" };
  }
}