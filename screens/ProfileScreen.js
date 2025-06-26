import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Button,
  ImageBackground,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import ProfileStatsBox from "../components/ProfileStatsBox";

export default function ProfileScreen() {
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <ImageBackground
      source={
        imageUri ? { uri: imageUri } : require("../assets/splash-icon.png")
      } // fallback image
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Button title="Choose Background Image" onPress={pickImage} />
        <ProfileStatsBox />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.85)", // translucent white for readability
    justifyContent: "center",
  },
});
