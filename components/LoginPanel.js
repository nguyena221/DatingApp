import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  View,
  Modal,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import styles from "../styles/LoginScreenStyle";

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
  passwordError,
}) {
  const heightAnim = useRef(new Animated.Value(isLogin ? 180 : 360)).current;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // ✅ Use state to track the previous error and only alert once
  const prevErrorRef = useRef("");

  useEffect(() => {
    if (passwordError && passwordError !== prevErrorRef.current) {
      Alert.alert("Password Error", passwordError);
      prevErrorRef.current = passwordError;
    }
  }, [passwordError]);

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isLogin ? 130 : 330,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isLogin]);

  const formatDate = (dateObj) =>
    dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (selectedDate) {
        setBirthday(formatDate(selectedDate));
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const confirmDate = () => {
    setBirthday(formatDate(tempDate));
    setShowDatePicker(false);
  };

  return (
    <Animated.View style={[styles.loginPanelContainer, { height: heightAnim }]}>
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
            maxLength={20}
          />

          <TouchableOpacity
            onPress={() => {
              if (birthday) {
                const [month, day, year] = birthday.split("/");
                setTempDate(new Date(year, month - 1, day));
              } else {
                setTempDate(new Date());
              }
              setShowDatePicker(true);
            }}
            style={[styles.input, { justifyContent: "center" }]}
          >
            <Text style={{ color: birthday ? "black" : "#aaa" }}>
              {birthday || "Select Birth Date"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "82%",
              backgroundColor: "white",
              borderRadius: 32,
              paddingVertical: 20,
              paddingHorizontal: 24,
              maxHeight: 300,
              marginBottom: -20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: 10,
            }}
          >
            {Platform.OS === "ios" && (
              <View style={{ alignItems: "flex-end", marginBottom: 10 }}>
                <TouchableOpacity onPress={confirmDate}>
                  <Text style={{ fontSize: 16, color: "#007AFF" }}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeDate}
              maximumDate={new Date()}
              style={{ width: "100%" }}
            />

            {Platform.OS === "android" && (
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={{ marginTop: 10, alignItems: "center" }}
              >
                <Text style={{ fontSize: 16, color: "#007AFF" }}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}
