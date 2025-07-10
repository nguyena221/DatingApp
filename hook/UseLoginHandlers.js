import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storeUser, checkTestUser } from "../backend/UserService";

export const UseLoginHandlers = ({
  email,
  getPass,
  firstN,
  lastN,
  birthDate,
  setLoginStatus,
  login,
  setPasswordError,
}) => {
  const MIN_PASS_LEN = 8;
  const MAX_PASS_LEN = 20;

  const isPasswordValid = () => {
    const pass = getPass();

    if (pass.length < MIN_PASS_LEN) {
      setPasswordError(`Password must be at least ${MIN_PASS_LEN} characters.`);
      return false;
    }
    if (pass.length > MAX_PASS_LEN) {
      setPasswordError(`Password must be at most ${MAX_PASS_LEN} characters.`);
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleCheck = async () => {
    const pass = getPass();
    if (!isPasswordValid()) return false;

    try {
      const res = await checkTestUser(email, pass);
      if (res.success) {
        await AsyncStorage.setItem("currentUserEmail", email);
        setLoginStatus("Login success!");
        login(email);
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
        password: getPass(), // getPass ensures latest value
        firstName: firstN,
        lastName: lastN,
        birthDate,
      };

      await storeUser(user); // will throw if email exists
      await AsyncStorage.setItem("currentUserEmail", email);
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
