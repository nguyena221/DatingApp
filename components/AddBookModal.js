// --- AddBookModal component ---

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  Linking,
  Alert,
  Animated,
  InteractionManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import {
  getUserWidgetData,
  addWidgetItem,
  removeWidgetItem,
  updateWidgetItem
} from '../backend/UserService';
import styles from '../styles/FavoriteBooksWidgetStyle';

const AddBookModal = ({
  visible,
  newBook,
  setNewBook,
  onClose,
  onSave,
  genreOptions,
  statusOptions,
  emojiOptions
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.addModalContainer}>
        <View style={styles.addModalHeader}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.addModalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.addModalTitle}>Add New Book</Text>
          <TouchableOpacity onPress={onSave} activeOpacity={0.7}>
            <Text style={styles.addModalSave}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.addModalContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          <View style={styles.addModalField}>
            <Text style={styles.addModalLabel}>Title *</Text>
            <TextInput
              style={styles.addModalInput}
              value={newBook.title}
              onChangeText={(text) => setNewBook(prev => ({ ...prev, title: text }))}
              placeholder="Enter book title"
              returnKeyType="next"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.addModalField}>
            <Text style={styles.addModalLabel}>Author *</Text>
            <TextInput
              style={styles.addModalInput}
              value={newBook.author}
              onChangeText={(text) => setNewBook(prev => ({ ...prev, author: text }))}
              placeholder="Enter author name"
              returnKeyType="next"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.addModalField}>
            <Text style={styles.addModalLabel}>Status</Text>
            <View style={styles.statusSelector}>
              {statusOptions.map(status => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.statusOption,
                    { backgroundColor: newBook.status === status.value ? status.color : '#f0f0f0' }
                  ]}
                  onPress={() => {
                    const updatedBook = { ...newBook, status: status.value };
                    if (status.value !== 'read') updatedBook.rating = 0;
                    setNewBook(updatedBook);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.statusOptionText,
                    { color: newBook.status === status.value ? 'white' : '#333' }
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {newBook.status === 'read' && (
            <View style={styles.addModalField}>
              <Text style={styles.addModalLabel}>Rating</Text>
              <View style={styles.ratingSelector}>
                {Array.from({ length: 5 }, (_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setNewBook(prev => ({ ...prev, rating: i + 1 }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.star, { fontSize: 28 }]}> 
                      {i < newBook.rating ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.addModalField}>
            <Text style={styles.addModalLabel}>Genre</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.genreSelector}>
                {genreOptions.map(genre => (
                  <TouchableOpacity
                    key={genre}
                    style={[
                      styles.genreOption,
                      newBook.genre === genre && styles.selectedGenreOption
                    ]}
                    onPress={() => setNewBook(prev => ({ ...prev, genre }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.genreOptionText,
                      newBook.genre === genre && styles.selectedGenreOptionText
                    ]}>
                      {genre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.addModalField}>
            <Text style={styles.addModalLabel}>Review/Notes</Text>
            <TextInput
              style={[styles.addModalInput, styles.reviewInput]}
              value={newBook.review}
              onChangeText={(text) => setNewBook(prev => ({ ...prev, review: text }))}
              placeholder="Your thoughts about this book..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              returnKeyType="done"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default AddBookModal;
