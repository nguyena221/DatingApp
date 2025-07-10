import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUserWithPersonality } from '../backend/UserService';
import { useUser } from '../contexts/UserContext';
import LogoutButton from '../components/LogoutButton';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { currentUser } = useUser();
  const [quizStatus, setQuizStatus] = useState({
    personality: false,
    lifestyle: false,
  });

  useFocusEffect(
    React.useCallback(() => {
      const checkQuizStatus = async () => {
        try {
          const userEmail = currentUser?.email || "test2@example.com";
          const result = await getUserWithPersonality(userEmail);

          if (result.success && result.user) {
            setQuizStatus({
              personality: !!result.user.personalityData,
              lifestyle: !!result.user.personalityLifestyleData,
            });
          }
        } catch (error) {
          console.error('Error checking quiz status:', error);
        }
      };

      checkQuizStatus();
    }, [currentUser])
  );

  const handlePersonalityQuiz = () => {
    navigation.navigate('PersonalityQuiz');
  };

  const handleLifestyleQuiz = () => {
    navigation.navigate('LifestyleQuiz');
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Discover Yourself</Text>
            <Text style={styles.subtitle}>
              Take our fun quizzes to unlock your personality and lifestyle insights!
            </Text>
          </View>

          <View style={styles.quizzesContainer}>
            {/* Personality Quiz Card */}
            <TouchableOpacity
              style={styles.quizCard}
              onPress={handlePersonalityQuiz}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.quizGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.quizContent}>
                  <Text style={styles.quizEmoji}>🧠</Text>
                  <Text style={styles.quizTitle}>Personality Quiz</Text>
                  <Text style={styles.quizDescription}>
                    Discover your unique personality type with our comprehensive MBTI-style assessment
                  </Text>
                  <View style={styles.quizDetails}>
                    <Text style={styles.quizDetailText}>• 24 Questions</Text>
                    <Text style={styles.quizDetailText}>• 5-7 Minutes</Text>
                    <Text style={styles.quizDetailText}>• MBTI-Based</Text>
                  </View>
                  <View style={styles.startButton}>
                    <Text style={styles.startButtonText}>
                      {quizStatus.personality ? 'Retake Quiz →' : 'Start Quiz →'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Lifestyle Quiz Card */}
            <TouchableOpacity
              style={styles.quizCard}
              onPress={handleLifestyleQuiz}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ff9a56', '#ffcd3c']}
                style={styles.quizGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.quizContent}>
                  <Text style={styles.quizEmoji}>🌟</Text>
                  <Text style={styles.quizTitle}>Lifestyle Quiz</Text>
                  <Text style={styles.quizDescription}>
                    Explore your preferences and lifestyle choices with our fun, quirky questions
                  </Text>
                  <View style={styles.quizDetails}>
                    <Text style={styles.quizDetailText}>• 20 Questions</Text>
                    <Text style={styles.quizDetailText}>• 3-5 Minutes</Text>
                    <Text style={styles.quizDetailText}>• Fun & Quirky</Text>
                  </View>
                  <View style={styles.startButton}>
                    <Text style={styles.startButtonText}>
                      {quizStatus.lifestyle ? 'Retake Quiz →' : 'Start Quiz →'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🎯 Complete quizzes to unlock personalized profile banners!
            </Text>
          </View>
          <View style={{height: 50}}>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  header: {
    paddingHorizontal: 30,
    paddingVertical: 50,
    paddingTop: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    paddingBottom: 10
  },
  quizzesContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginTop: -40,
  },
  quizCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  quizGradient: {
    borderRadius: 20,
    padding: 20,
    minHeight: 160,
  },
  quizContent: {
    alignItems: 'center',
  },
  quizEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  quizDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  quizDetails: {
    alignItems: 'center',
    marginBottom: 18,
  },
  quizDetailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  footer: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.2)',
  },
});
