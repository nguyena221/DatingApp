// contexts/UserContext.js
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ manually sets the user
  const login = ({ email }) => {
    setUser({ email });
  };

  return (
    <UserContext.Provider value={{ user, setUser, login }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook so you can do: const { user, login } = useUser();
export const useUser = () => useContext(UserContext);
