// Create this as: components/FaceAvatarDisplay.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const FaceAvatarDisplay = ({ avatarType, size = 170, showBorder = true }) => {
  // Add debugging
  console.log("🎭 FaceAvatarDisplay received:", { avatarType, size, showBorder });
  
  const getFaceData = (type) => {
    const faces = {
      happy: {
        emoji: '😊',
        color: ['#FFE066', '#FF9A8A'],
        name: 'Happy'
      },
      cool: {
        emoji: '😎',
        color: ['#4FACFE', '#00F2FE'],
        name: 'Cool'
      },
      curious: {
        emoji: '🤔',
        color: ['#A8EDEA', '#FED6E3'],
        name: 'Curious'
      },
      mischievous: {
        emoji: '😏',
        color: ['#D299C2', '#FEF9D7'],
        name: 'Mischievous'
      },
      determined: {
        emoji: '😤',
        color: ['#667eea', '#764ba2'],
        name: 'Determined'
      }
    };
    
    const result = faces[type] || faces.happy;
    console.log("🎭 Face data for type", type, ":", result);
    return result;
  };

  const faceData = getFaceData(avatarType);

  return (
    <View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          borderWidth: showBorder ? 3 : 0,
        }
      ]}
    >
      <LinearGradient
        colors={faceData.color}
        style={[
          styles.gradient,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2 
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.emoji, { fontSize: size * 0.4 }]}>
          {faceData.emoji}
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    right:5,
    bottom:5
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default FaceAvatarDisplay;