import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // add this
import { storeUser, checkTestUser } from "../backend/UserService";

export const UseLoginHandlers = ({
  email,
  pass,
  firstN,
  lastN,
  birthDate,
  setLoginStatus,
  login,
}) => {
  const handleCheck = async () => {
    try {
      const res = await checkTestUser(email, pass);
      if (res.success) {
        await AsyncStorage.setItem("currentUserEmail", email); // ✅ Save to AsyncStorage
        setLoginStatus("Login success!");
        login(email); // optional if using context
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
        birthDate,
      };

      await storeUser(user);
      await AsyncStorage.setItem("currentUserEmail", email); // ✅ Save to AsyncStorage
      login(email);
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
