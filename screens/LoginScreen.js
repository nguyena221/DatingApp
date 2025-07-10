import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LoginPanel from "../components/LoginPanel";
import AuthTabs from "../components/LoginTabs";
import SubmitButton from "../components/SubmitButton";
import { UseLoginHandlers } from "../hook/UseLoginHandlers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/LoginScreenStyle";
import { useUser } from "../contexts/UserContext";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login: contextLogin } = useUser();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [firstN, setFirstN] = useState("");
  const [lastN, setLastN] = useState("");
  const [birthDate, setBirthDate] = useState();
  const [gender, setGender] = useState("");
  const [sexualOrientation, setSexualOrientation] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState("LOGIN");
  const [passwordError, setPasswordError] = useState("");

  const login = async (email) => {
    try {
      await AsyncStorage.setItem("userEmail", email);
      contextLogin({ email });
    } catch (error) {
      console.error("Failed to save userEmail:", error);
    }
  };

  const { handleCheck, handleStore } = UseLoginHandlers({
    email,
    getPass: () => pass,
    firstN,
    lastN,
    birthDate,
    gender,
    sexualOrientation,
    setLoginStatus,
    login,
    setPasswordError,
  });
  

  const handleLogin = async () => {
    const success = await handleCheck();
    if (success) {
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } 
  };

  const handleRegister = async () => {
    const success = await handleStore();
    if (success) {
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } 
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1 }}>
            {/* Static gradient background */}
            <LinearGradient
              colors={["#ffb005", "#667eea", "#764ba2", "#6b8dd6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Foreground content */}
            <View style={styles.mainContainer}>
              <Text style={styles.title}>GameDate</Text>

              <View
                style={[
                  styles.logPanel,
                  {
                    backgroundColor: "white",
                    borderRadius: 30,
                    padding: 20,
                    marginHorizontal: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 8,
                  },
                ]}
              >
                <AuthTabs
                  activeTab={activeTab}
                  setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setIsLogin(tab === "LOGIN");
                  }}
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
                  gender={gender}
                  setGender={setGender}
                  sexualOrientation={sexualOrientation}
                  setSexualOrientation={setSexualOrientation}
                  passwordError={passwordError}
                />

                <SubmitButton
                  onPress={isLogin ? handleLogin : handleRegister}
                />

                <TouchableOpacity
                  onPress={() => {
                    const tab = isLogin ? "REGISTER" : "LOGIN";
                    setIsLogin(!isLogin);
                    setActiveTab(tab);
                  }}
                >
                  <Text style={styles.switchText}>
                    {isLogin
                      ? "Don't have an account? Sign Up"
                      : "Already have an account? Log In"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
