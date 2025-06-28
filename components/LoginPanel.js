import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

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
  return (
    <View style={styles.container}>
      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            style={styles.input}
            placeholder="Birthday (MM/DD/YYYY)"
            value={birthday}
            onChangeText={setBirthday}
            keyboardType="numeric"
          />
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    width: "100%",
  },
});
