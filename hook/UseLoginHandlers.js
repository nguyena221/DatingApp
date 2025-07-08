import { Alert } from "react-native";
import { storeUser, checkTestUser } from "../backend/UserService";

export const UseLoginHandlers = ({
  email,
  pass,
  firstN,
  lastN,
  birthDate,
  setLoginStatus,
}) => {
  const handleCheck = async () => {
    try {
      const res = await checkTestUser(email, pass);
      if (res.success) {
        setLoginStatus("Login success!");
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
      const formattedBirthDate = new Date(birthDate).toLocaleDateString("en-US");

      const user = {
        email,
        password: pass,
        firstName: firstN,
        lastName: lastN,
        birthDate: formattedBirthDate,
      };

      await storeUser(user);
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
