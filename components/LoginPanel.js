// components/LoginPanel.js
import React, { useEffect, useRef } from "react";
import {
  Animated,
  TextInput,
} from "react-native";
import styles from "../styles/LoginScreenStyle"

export default function LoginPanel({
  isLogin,
  email,
  setEmail,
  password,
  setPassword,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  birthday,
  setBirthday,
}) {
  const heightAnim = useRef(new Animated.Value(isLogin ? 180 : 360)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isLogin ? 130 : 330, // adjust for your form size
      duration: 300,
      useNativeDriver: false,
    }).start();

    slideAnim.setValue(isLogin ? 300 : -300);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isLogin]);

  return (
    <Animated.View style={[styles.loginPanelContainer, { height: heightAnim }]}>
      <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
        {/* Common Fields */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {/* Extra fields for Register */}
        {!isLogin && (
          <>
            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
            />
            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
            />
            <TextInput
              placeholder="Birth Date"
              value={birthday}
              onChangeText={setBirthday}
              style={styles.input}
            />
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
}