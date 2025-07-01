import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LoginPanel from "../components/LoginPanel";
import AuthTabs from "../components/LoginTabs";
import SubmitButton from "../components/SubmitButton";
import { UseLoginHandlers } from "../hook/UseLoginHandlers";
import styles from "../styles/LoginScreenStyle";

export default function LoginScreen() {
  const [email, setEmail] = useState("test2@example.com");
  const [pass, setPass] = useState("pass123");
  const [firstN, setFirstN] = useState("Annie");
  const [lastN, setLastN] = useState("Doe");
  const [birthDate, setBirthDate] = useState("01/01/2001");
  const [loginStatus, setLoginStatus] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState("LOGIN");

  const { handleCheck, handleStore } = UseLoginHandlers({
    email,
    pass,
    firstN,
    lastN,
    birthDate,
    setLoginStatus,
  });

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.title}>DatingApp</Text>

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

        {/* Submit Button */}
        <SubmitButton onPress={isLogin ? handleCheck : handleStore} />

        {/* Links */}
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