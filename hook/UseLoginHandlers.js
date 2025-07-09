import { Alert } from "react-native";
import { storeUser, checkTestUser } from "../backend/UserService";

export const UseLoginHandlers = ({
  email,
  pass,
  firstN,
  lastN,
  birthDate,
  setLoginStatus,
  login, // Add this parameter
}) => {
  const handleCheck = async () => {
    try {
      const res = await checkTestUser(email, pass);
      if (res.success) {
        setLoginStatus("Login success!");
        login(email); // Set the current user
        Alert.alert("Success", res.message);
        return true;
      } else {
        setLoginStatus("Login failed.");
        Alert.alert("Failed", res.message);
        return false;
      }
    } catch (err) {
      Alert.alert("Error", err.message);
      return false;
    }
  };

  const handleStore = async () => {
    try {
      const user = {
        email,
        password: pass,
        firstName: firstN,
        lastName: lastN,
        birthDate: birthDate, // Store as-is from the input
      };

      await storeUser(user);
      login(email); // Set the current user after registration
      setLoginStatus("Registration success!");
      Alert.alert("Success", "User registered successfully.");
      return true;
    } catch (err) {
      Alert.alert("Error", err.message);
      return false;
    }
  };

  return { handleCheck, handleStore };
};