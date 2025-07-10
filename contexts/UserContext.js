import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ Load user from AsyncStorage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const email = await AsyncStorage.getItem("currentUserEmail");
        if (email) {
          setUser({ email });
        }
      } catch (error) {
        console.error("Failed to load user from AsyncStorage:", error);
      }
    };
    loadUser();
  }, []);

  const login = ({ email }) => {
    setUser({ email });
  };

  const logout = () => {
    setUser(null);
    AsyncStorage.removeItem("currentUserEmail"); // ✅ Clear on logout
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      currentUser: user,
      setUser, 
      login,
      logout 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);