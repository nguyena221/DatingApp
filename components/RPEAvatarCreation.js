import React, { useState } from 'react';
import { View, StyleSheet, Button, Image, Text } from 'react-native';
import { WebView } from 'react-native-webview';

export default function AvatarCreator() {
  const [showWebView, setShowWebView] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Ready Player Me configuration
  const RPM_URL = 'https://demo.readyplayer.me/avatar?frameApi';

  const handleWebViewMessage = (event) => {
    const message = JSON.parse(event.nativeEvent.data);
    
    if (message.eventName === 'v1.avatar.exported') {
      // Avatar creation completed
      const avatarUrl = message.data.url;
      setAvatarUrl(avatarUrl);
      setShowWebView(false);
      
      // Save avatar URL to your user's profile
      console.log('Avatar created:', avatarUrl);
    }
  };

  const openAvatarCreator = () => {
    setShowWebView(true);
  };

  const closeAvatarCreator = () => {
    setShowWebView(false);
  };

  if (showWebView) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button title="Close" onPress={closeAvatarCreator} />
        </View>
        <WebView
          source={{ uri: RPM_URL }}
          style={styles.webview}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Avatar</Text>
      
      {avatarUrl ? (
        <View style={styles.avatarContainer}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <Button title="Edit Avatar" onPress={openAvatarCreator} />
        </View>
      ) : (
        <Button title="Create Avatar" onPress={openAvatarCreator} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 10,
  },
  webview: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
});