import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { storeLifestyleData, autoGenerateProfileBanners  } from '../backend/UserService';
import { useUser } from '../contexts/UserContext';

const { width } = Dimensions.get('window');

const LifestyleQuizScreen = ({ onQuizComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [lifestyleType, setLifestyleType] = useState('');
  const [scores, setScores] = useState({});

  const questions = [
    {
      id: 'unwind',
      question: '📚 How do you prefer to unwind?',
      options: [
        { text: '📖 Read a good book', value: 0 },
        { text: '📺 Binge-watch TV shows', value: 1 }
      ]
    },
    {
      id: 'friday_night',
      question: '🌙 Perfect Friday night?',
      options: [
        { text: '🕺 Hit the club and dance', value: 0 },
        { text: '🍿 Movie night at home', value: 1 }
      ]
    },
    {
      id: 'living_location',
      question: '🏠 Where would you rather live?',
      options: [
        { text: '🏙️ Bustling city center', value: 0 },
        { text: '🌾 Peaceful countryside', value: 1 }
      ]
    },
    {
      id: 'candy',
      question: '🍬 Sweet tooth dilemma:',
      options: [
        { text: '🌈 Skittles all the way', value: 0 },
        { text: '🍫 Classic M&Ms', value: 1 }
      ]
    },
    {
      id: 'pets',
      question: '🐾 Your ideal companion?',
      options: [
        { text: '🐱 Mysterious cat vibes', value: 0 },
        { text: '🐶 Loyal dog energy', value: 1 }
      ]
    },
    {
      id: 'drink',
      question: '☕ Morning fuel of choice?',
      options: [
        { text: '☕ Strong coffee boost', value: 0 },
        { text: '🍵 Calming tea ritual', value: 1 }
      ]
    },
    {
      id: 'time_of_day',
      question: '⏰ When do you feel most alive?',
      options: [
        { text: '🌅 Early morning hours', value: 0 },
        { text: '🌙 Late night vibes', value: 1 }
      ]
    },
    {
      id: 'organization',
      question: '📋 Your living space style?',
      options: [
        { text: '✨ Everything in its place', value: 0 },
        { text: '🌪️ Creative chaos', value: 1 }
      ]
    },
    {
      id: 'vacation',
      question: '🌍 Dream vacation destination?',
      options: [
        { text: '🏖️ Sandy beaches and waves', value: 0 },
        { text: '⛰️ Mountain peaks and trails', value: 1 }
      ]
    },
    {
      id: 'relationships',
      question: '💕 Relationship style?',
      options: [
        { text: '📖 Open book, share everything', value: 0 },
        { text: '🗝️ Keep some mystery', value: 1 }
      ]
    },
    {
      id: 'stress_relief',
      question: '💪 Stress relief method?',
      options: [
        { text: '🏋️ Hit the gym hard', value: 0 },
        { text: '📚 Get lost in books', value: 1 }
      ]
    },
    {
      id: 'vibe',
      question: '😄 Pick your vibe:',
      options: [
        { text: '🦄 Magical unicorn energy', value: 0 },
        { text: '🤖 Cool robot logic', value: 1 }
      ]
    },
    {
      id: 'home',
      question: '🏡 Your dream home?',
      options: [
        { text: '🏠 Cozy cottage in the woods', value: 0 },
        { text: '🏰 Grand mansion with everything', value: 1 }
      ]
    },
    {
      id: 'entertainment',
      question: '🎮 Entertainment preference?',
      options: [
        { text: '🎮 Epic video game sessions', value: 0 },
        { text: '🎲 Classic board game nights', value: 1 }
      ]
    },
    {
      id: 'exercise',
      question: '🏃 Getting your steps in?',
      options: [
        { text: '🏃‍♀️ Power run for the endorphins', value: 0 },
        { text: '🚶‍♀️ Peaceful walk to think', value: 1 }
      ]
    },
    {
      id: 'sunday',
      question: '☀️ Perfect Sunday vibes?',
      options: [
        { text: '🛏️ Lazy day in bed', value: 0 },
        { text: '☕ People-watching at a cafe', value: 1 }
      ]
    },
    {
      id: 'creativity',
      question: '🎨 Creative outlet?',
      options: [
        { text: '🎭 Performing for others', value: 0 },
        { text: '✍️ Writing in private', value: 1 }
      ]
    },
    {
      id: 'food',
      question: '🍕 Food adventure level?',
      options: [
        { text: '🌶️ Spicy exotic cuisines', value: 0 },
        { text: '🍞 Comfort food classics', value: 1 }
      ]
    },
    {
      id: 'travel',
      question: '🚗 Travel style?',
      options: [
        { text: '🗺️ Detailed itinerary planned', value: 0 },
        { text: '🎒 Wing it and see what happens', value: 1 }
      ]
    },
    {
      id: 'problem_solving',
      question: '💭 Problem-solving approach?',
      options: [
        { text: '🧠 Logic and analysis', value: 0 },
        { text: '💖 Gut feeling and intuition', value: 1 }
      ]
    }
  ];

  const lifestyleTypes = {
    'The Social Butterfly': '🦋 You thrive on connections and social energy!',
    'The Peaceful Soul': '🕊️ You find beauty in quiet moments and inner peace.',
    'The Adventure Seeker': '🌟 You live for new experiences and bold choices!',
    'The Comfort Lover': '🏠 You appreciate the simple pleasures and cozy vibes.',
    'The Creative Spirit': '🎨 You see the world through an artistic lens.',
    'The Logical Mind': '🧠 You approach life with reason and structure.',
    'The Free Spirit': '🍃 You go with the flow and embrace spontaneity.',
    'The Organizer': '📋 You love structure and having everything planned.'
  };

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults(newAnswers);
    }
  };

  const calculateResults = (finalAnswers) => {
    // Store raw answers as 0s and 1s
    const preferences = {};
    Object.entries(finalAnswers).forEach(([questionId, value]) => {
      preferences[questionId] = value;
    });

    // Generate quirky description based on specific combinations
    const description = generateQuirkyDescription(preferences);

    setLifestyleType('Your Lifestyle Snapshot');
    setScores(preferences);
    setShowResults(true);

    // Call the callback function with the lifestyle data for Firebase storage
    if (onQuizComplete) {
      const lifestyleData = {
        preferences: preferences,
        description: description,
        completedAt: new Date().toISOString(),
        quizType: 'lifestyle'
      };
      onQuizComplete(lifestyleData);
    }
  };

  const generateQuirkyDescription = (prefs) => {
    let description = "You're ";
    
    // Reading vs TV
    if (prefs.unwind === 0) {
      description += "a book lover who ";
    } else {
      description += "a binge-watcher who ";
    }
    
    // Friday night preference
    if (prefs.friday_night === 0) {
      description += "parties at clubs, ";
    } else {
      description += "prefers cozy movie nights, ";
    }
    
    // Living location
    if (prefs.living_location === 0) {
      description += "thrives in the city buzz, ";
    } else {
      description += "finds peace in the countryside, ";
    }
    
    // Candy preference
    if (prefs.candy === 0) {
      description += "Team Skittles, ";
    } else {
      description += "Team M&Ms, ";
    }
    
    // Pet preference
    if (prefs.pets === 0) {
      description += "definitely a cat person, ";
    } else {
      description += "absolutely a dog person, ";
    }
    
    // Drink preference
    if (prefs.drink === 0) {
      description += "runs on coffee, ";
    } else {
      description += "finds zen in tea, ";
    }
    
    // Time of day
    if (prefs.time_of_day === 0) {
      description += "loves mornings ";
    } else {
      description += "comes alive at night ";
    }
    
    // Organization
    if (prefs.organization === 0) {
      description += "with everything perfectly organized. ";
    } else {
      description += "and embraces the beautiful chaos. ";
    }
    
    // Add vacation preference
    if (prefs.vacation === 0) {
      description += "Beach vacations ";
    } else {
      description += "Mountain adventures ";
    }
    
    // Relationship style
    if (prefs.relationships === 0) {
      description += "are your thing, and you're an open book in relationships. ";
    } else {
      description += "call to you, and you keep some mystery in love. ";
    }
    
    // Home preference finale
    if (prefs.home === 0) {
      description += "Your dream? A cozy cottage where you can ";
    } else {
      description += "Your dream? A grand mansion where you can ";
    }
    
    // Exercise preference
    if (prefs.exercise === 0) {
      description += "go for power runs ";
    } else {
      description += "take peaceful walks ";
    }
    
    // Sunday preference
    if (prefs.sunday === 0) {
      description += "before spending Sundays in bed! 🛏️✨";
    } else {
      description += "then people-watch at cafes on Sundays! ☕👀";
    }
    
    return description;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setLifestyleType('');
    setScores({});
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (showResults) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#ff9a56', '#ffcd3c']}
          style={styles.gradient}
        >
          <ScrollView contentContainerStyle={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Your Lifestyle Snapshot</Text>
            <Text style={styles.description}>
              {generateQuirkyDescription(scores)}
            </Text>
            
            <TouchableOpacity style={styles.retakeButton} onPress={resetQuiz}>
              <Text style={styles.retakeButtonText}>Retake Quiz</Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ff9a56', '#ffcd3c']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Lifestyle Quiz</Text>
          <Text style={styles.progress}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>

        <ScrollView style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {questions[currentQuestion].question}
          </Text>

          <View style={styles.optionsContainer}>
            {questions[currentQuestion].options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleAnswer(option.value)}
              >
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {currentQuestion > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  progress: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 20,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  backButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  lifestyleType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  traitsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  traitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  trait: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  traitText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  traitScore: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  retakeButton: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  retakeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff9a56',
  },
});

// Updated Firebase integration for lifestyle quiz
const LifestyleQuizWithFirebase = () => {
  const { currentUser } = useUser(); // Use the current logged-in user

  const handleQuizComplete = async (lifestyleData) => {
  try {
    const userEmail = currentUser?.email || "test2@example.com";
    const result = await storeLifestyleData(userEmail, lifestyleData);
    
    if (result.success) {
      // Auto-generate profile banners after saving lifestyle data
      await autoGenerateProfileBanners(userEmail);
      
      Alert.alert(
        'Quiz Complete!', 
        'Your lifestyle preferences have been saved!'
      );
    } else {
      Alert.alert('Error', result.message);
    }
  } catch (error) {
    console.error('Error saving lifestyle data:', error);
    Alert.alert('Error', 'Failed to save your lifestyle data.');
  }
};

  return <LifestyleQuizScreen onQuizComplete={handleQuizComplete} />;
};

export default LifestyleQuizWithFirebase;