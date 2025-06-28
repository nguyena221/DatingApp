import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { storeTestUser, checkTestUser } from "../backend/UserService";
import { Ionicons } from "@expo/vector-icons";
import LoginPanel from "../components/LoginPanel";

export default function LogInScreenTest() {
  const [email, setEmail] = useState("test1@example.com");
  const [pass, setPass] = useState("pass123");
  const [firstN, setFirstN] = useState("Jane");
  const [lastN, setLastN] = useState("Doe");
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [loginStatus, setLoginStatus] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState("LOGIN");

  const handleStore = () => {
    storeTestUser({
      email,
      password: pass,
      firstName: firstN,
      lastName: lastN,
      birthDate,
    })
      .then(() => Alert.alert("Success", "User stored successfully!"))
      .catch((err) => Alert.alert("Error", err.message));
  };

  const handleCheck = () => {
    checkTestUser(email, pass, (success) => {
      if (success) {
        setLoginStatus("Login success!");
        Alert.alert("Success", "Login credentials match!");
      } else {
        setLoginStatus("Login failed.");
        Alert.alert("Failed", "Credentials incorrect or user not found.");
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DatingApp</Text>

      <View style={styles.logPanel}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => {
              setActiveTab("LOGIN");
              setIsLogin(true);
            }}
          >
            <Text
              style={[styles.tab, activeTab === "LOGIN" && styles.activeTab]}
            >
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setActiveTab("REGISTER");
              setIsLogin(false);
            }}
          >
            <Text
              style={[styles.tab, activeTab === "REGISTER" && styles.activeTab]}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>

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
        <TouchableOpacity
          style={[styles.loginButton, { opacity: 0.5 }]}
          onPress={() => {
            if (isLogin) {
              handleCheck();
            } else {
              handleStore();
            }
          }}
        >
          <Ionicons name="arrow-forward" size={28} color="#fff" />
        </TouchableOpacity>

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

const styles = StyleSheet.create({
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
});
