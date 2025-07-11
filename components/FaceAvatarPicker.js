// Create this as: components/FaceAvatarPicker.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const FaceAvatarPicker = ({ onSelectAvatar, selectedAvatar }) => {
  const faceOptions = [
    {
      id: 'happy',
      name: 'Happy',
      emoji: '😊',
      face: '😊',
      color: ['#FFE066', '#FF9A8A'],
      description: 'Cheerful & Friendly'
    },
    {
      id: 'cool',
      name: 'Cool',
      emoji: '😎',
      face: '😎',
      color: ['#4FACFE', '#00F2FE'],
      description: 'Confident & Chill'
    },
    {
      id: 'curious',
      name: 'Curious',
      emoji: '🤔',
      face: '🤔',
      color: ['#A8EDEA', '#FED6E3'],
      description: 'Thoughtful & Inquisitive'
    },
    {
      id: 'mischievous',
      name: 'Mischievous',
      emoji: '😏',
      face: '😏',
      color: ['#D299C2', '#FEF9D7'],
      description: 'Playful & Clever'
    },
    {
      id: 'determined',
      name: 'Determined',
      emoji: '😤',
      face: '😤',
      color: ['#667eea', '#764ba2'],
      description: 'Focused & Strong'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Avatar Style</Text>
      <Text style={styles.subtitle}>Pick a face that represents your personality</Text>
      
      <View style={styles.faceGrid}>
        {faceOptions.map((face) => (
          <TouchableOpacity
            key={face.id}
            style={[
              styles.faceOption,
              selectedAvatar === face.id && styles.selectedFace
            ]}
            onPress={() => onSelectAvatar(face)}
          >
            <LinearGradient
              colors={face.color}
              style={styles.faceGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.faceEmoji}>{face.face}</Text>
              <Text style={styles.faceName}>{face.name}</Text>
              <Text style={styles.faceDescription}>{face.description}</Text>
              
              {selectedAvatar === face.id && (
                <View style={styles.selectedCheckmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  faceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  faceOption: {
    width: '45%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  selectedFace: {
    // Remove: borderWidth: 3,
    // Remove: borderColor: '#007AFF',
    // Add shadow instead:
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
    },
  faceGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    position: 'relative',
  },
  faceEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  faceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  faceDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FaceAvatarPicker;