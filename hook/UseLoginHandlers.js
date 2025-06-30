import { Alert } from "react-native";
import { storeTestUser, checkTestUser } from "../backend/UserService";

export const UseLoginHandlers = ({
  email,
  pass,
  firstN,
  lastN,
  birthDate,
  setLoginStatus,
}) => {
  const handleCheck = () => {
    checkTestUser(email, pass)
      .then((res) => {
        if (res.success) {
          setLoginStatus("Login success!");
          Alert.alert("Success", res.message);
        } else {
          setLoginStatus("Login failed.");
          Alert.alert("Failed", res.message);
        }
      })
      .catch((err) => {
        Alert.alert("Error", err.message);
      });
  };

  const handleStore = () => {
    const formattedBirthDate = new Date(birthDate).toLocaleDateString("en-US");

    const user = {
      email,
      password: pass,
      firstName: firstN,
      lastName: lastN,
      birthDate: formattedBirthDate,
    };

    storeTestUser(user)
      .then(() => {
        setLoginStatus("Registration success!");
        Alert.alert("Success", "User registered successfully.");
      })
      .catch((err) => {
        Alert.alert("Error", err.message);
      });
  };

  return { handleCheck, handleStore };
};