import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LoginPanel from "../components/LoginPanel";
import AuthTabs from "../components/LoginTabs";
import SubmitButton from "../components/SubmitButton";
import { UseLoginHandlers } from "../hook/UseLoginHandlers";

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
    <View style={styles.container}>
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

/* const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8ebd9d",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: "#1b475d",
    fontSize: 40,
    marginBottom: 40,
    textAlign: "center",
    fontWeight: "bold",
  },
  logPanel: {
    backgroundColor: "#eee5c2",
    borderRadius: 40,
    paddingVertical: 40,
    paddingHorizontal: 40,
    width: "90%",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  tab: {
    marginHorizontal: 20,
    fontSize: 18,
    color: "#888",
  },
  activeTab: {
    color: "#1b475d",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#1b475d",
    borderRadius: 100,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 12,
  },
  forgotText: {
    color: "#1b475d",
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  switchText: {
    color: "#1b475d",
    textAlign: "center",
    fontSize: 14,
  },
}); */
