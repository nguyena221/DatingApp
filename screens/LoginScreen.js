import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LoginPanel from "../components/LoginPanel";
import AuthTabs from "../components/LoginTabs";
import SubmitButton from "../components/SubmitButton";
import { UseLoginHandlers } from "../hook/UseLoginHandlers";
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Added
import styles from "../styles/LoginScreenStyle";

export default function LoginScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("test2@example.com");
  const [pass, setPass] = useState("pass123");
  const [firstN, setFirstN] = useState("Annie");
  const [lastN, setLastN] = useState("Doe");
  const [birthDate, setBirthDate] = useState("01/01/2001");
  const [loginStatus, setLoginStatus] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState("LOGIN");

  // ✅ Local login function to save email to AsyncStorage
  const login = async (email) => {
    try {
      await AsyncStorage.setItem("userEmail", email);
    } catch (error) {
      console.error("Failed to save userEmail:", error);
    }
  };

  const { handleCheck, handleStore } = UseLoginHandlers({
    email,
    pass,
    firstN,
    lastN,
    birthDate,
    setLoginStatus,
    login,
  });

  const handleLogin = async () => {
    const success = await handleCheck();
    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } else {
      Alert.alert("Login Failed", "Invalid email or password.");
    }
  };

  const handleRegister = async () => {
    const success = await handleStore();
    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } else {
      Alert.alert("Registration Failed", "Please check your input.");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.title}>GameDate</Text>

      <View style={styles.logPanel}>
        <AuthTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsLogin={setIsLogin}
        />

        <LoginPanel
          isLogin={isLogin}
          email={email}
          setEmail={setEmail}
          password={pass}
          setPassword={setPass}
          firstName={firstN}
          setFirstName={setFirstN}
          lastName={lastN}
          setLastName={setLastN}
          birthday={birthDate}
          setBirthday={setBirthDate}
        />

        <SubmitButton onPress={isLogin ? handleLogin : handleRegister} />

        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Log In"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
