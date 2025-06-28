import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LoginPanel from "../components/LoginPanel";
import { useNavigation } from "@react-navigation/native";


const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState("LOGIN");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");

  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleAuth = async () => {
    if (
      !email ||
      !password ||
      (!isLogin && (!firstName || !lastName || !birthday))
    ) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        await loginUser(email, password);
        Alert.alert("Logged In", "Welcome back!");
      } else {
        await registerUser(email, password, {
          firstName,
          lastName,
          birthday,
        });
        Alert.alert("Signed Up", `Welcome ${firstName}!`);
      }
    } catch (err) {
      Alert.alert("Authentication Error", err.message);
    } finally {
      setLoading(false);
    }
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

        {/* Form */}
        <LoginPanel
          isLogin={isLogin}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          birthday={birthday}
          setBirthday={setBirthday}
        />

        {/* Loading Indicator */}
        {loading && (
          <ActivityIndicator
            size="small"
            color="#1b475d"
            style={{ marginBottom: 10 }}
          />
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.5 }]}
          onPress={handleAuth}
          disabled={loading}
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
};

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

export default LoginScreen;
