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
import { storePersonalityData, autoGenerateProfileBanners } from '../backend/UserService';
import { useUser } from '../contexts/UserContext';

const { width } = Dimensions.get('window');

const PersonalityQuizScreen = ({ onQuizComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [personalityType, setPersonalityType] = useState('');
  const [scores, setScores] = useState({});

  const questions = [
    {
      id: 'q1',
      question: 'At a party, you would rather:',
      options: [
        { text: 'Mingle with many different people', value: 'E' },
        { text: 'Have deep conversations with a few close friends', value: 'I' }
      ]
    },
    {
      id: 'q2',
      question: 'When making decisions, you typically:',
      options: [
        { text: 'Focus on logic and objective analysis', value: 'T' },
        { text: 'Consider how it will affect people\'s feelings', value: 'F' }
      ]
    },
    {
      id: 'q3',
      question: 'You prefer to:',
      options: [
        { text: 'Have things planned and organized', value: 'J' },
        { text: 'Keep your options open and be spontaneous', value: 'P' }
      ]
    },
    {
      id: 'q4',
      question: 'When learning something new, you:',
      options: [
        { text: 'Focus on facts and concrete details', value: 'S' },
        { text: 'Look for patterns and possibilities', value: 'N' }
      ]
    },
    {
      id: 'q5',
      question: 'You gain energy from:',
      options: [
        { text: 'Being around other people', value: 'E' },
        { text: 'Spending time alone or with close friends', value: 'I' }
      ]
    },
    {
      id: 'q6',
      question: 'When working on a project, you:',
      options: [
        { text: 'Like to finish it well before the deadline', value: 'J' },
        { text: 'Work best under pressure near the deadline', value: 'P' }
      ]
    },
    {
      id: 'q7',
      question: 'You are more interested in:',
      options: [
        { text: 'What is actually happening', value: 'S' },
        { text: 'What could be possible', value: 'N' }
      ]
    },
    {
      id: 'q8',
      question: 'When someone is upset, you:',
      options: [
        { text: 'Focus on their emotional needs', value: 'F' },
        { text: 'Try to analyze the problem logically', value: 'T' }
      ]
    },
    {
      id: 'q9',
      question: 'You prefer conversations that are:',
      options: [
        { text: 'Practical and about real experiences', value: 'S' },
        { text: 'Theoretical and about ideas', value: 'N' }
      ]
    },
    {
      id: 'q10',
      question: 'In your ideal work environment, you would:',
      options: [
        { text: 'Collaborate frequently with others', value: 'E' },
        { text: 'Have quiet time to focus deeply', value: 'I' }
      ]
    },
    {
      id: 'q11',
      question: 'You make decisions based on:',
      options: [
        { text: 'Logical analysis of the situation', value: 'T' },
        { text: 'Personal values and impact on others', value: 'F' }
      ]
    },
    {
      id: 'q12',
      question: 'Your living space tends to be:',
      options: [
        { text: 'Neat and organized', value: 'J' },
        { text: 'Comfortable with some clutter', value: 'P' }
      ]
    },
    {
      id: 'q13',
      question: 'You prefer to:',
      options: [
        { text: 'Follow established methods', value: 'S' },
        { text: 'Find new ways of doing things', value: 'N' }
      ]
    },
    {
      id: 'q14',
      question: 'When meeting new people, you:',
      options: [
        { text: 'Introduce yourself readily', value: 'E' },
        { text: 'Wait for them to approach you', value: 'I' }
      ]
    },
    {
      id: 'q15',
      question: 'You value:',
      options: [
        { text: 'Justice and fairness', value: 'T' },
        { text: 'Harmony and compassion', value: 'F' }
      ]
    },
    {
      id: 'q16',
      question: 'You prefer to make plans:',
      options: [
        { text: 'Well in advance', value: 'J' },
        { text: 'As you go along', value: 'P' }
      ]
    },
    {
      id: 'q17',
      question: 'You are more drawn to:',
      options: [
        { text: 'Practical applications', value: 'S' },
        { text: 'Theoretical concepts', value: 'N' }
      ]
    },
    {
      id: 'q18',
      question: 'After a long day, you prefer to:',
      options: [
        { text: 'Go out with friends', value: 'E' },
        { text: 'Relax at home', value: 'I' }
      ]
    },
    {
      id: 'q19',
      question: 'In conflicts, you tend to:',
      options: [
        { text: 'Stand firm on principles', value: 'T' },
        { text: 'Seek compromise and understanding', value: 'F' }
      ]
    },
    {
      id: 'q20',
      question: 'You prefer activities that are:',
      options: [
        { text: 'Structured and planned', value: 'J' },
        { text: 'Flexible and spontaneous', value: 'P' }
      ]
    },
    {
      id: 'q21',
      question: 'You pay more attention to:',
      options: [
        { text: 'Details and specifics', value: 'S' },
        { text: 'The big picture', value: 'N' }
      ]
    },
    {
      id: 'q22',
      question: 'When working in a group, you:',
      options: [
        { text: 'Enjoy brainstorming out loud', value: 'E' },
        { text: 'Prefer to think before speaking', value: 'I' }
      ]
    },
    {
      id: 'q23',
      question: 'You are more comfortable with:',
      options: [
        { text: 'Constructive criticism', value: 'T' },
        { text: 'Positive encouragement', value: 'F' }
      ]
    },
    {
      id: 'q24',
      question: 'Your ideal weekend would be:',
      options: [
        { text: 'Following a planned schedule', value: 'J' },
        { text: 'Seeing where the day takes you', value: 'P' }
      ]
    }
  ];

  const personalityDescriptions = {
    'INTJ': 'The Architect - Strategic, independent, and highly analytical. You prefer to work alone and focus on long-term planning.',
    'INTP': 'The Thinker - Logical, abstract, and love theoretical concepts. You enjoy exploring ideas and possibilities.',
    'ENTJ': 'The Commander - Natural leaders who are strategic and goal-oriented. You excel at organizing and directing others.',
    'ENTP': 'The Debater - Innovative and enthusiastic about new ideas. You enjoy intellectual challenges and debates.',
    'INFJ': 'The Advocate - Idealistic and insightful with strong values. You focus on helping others and making a difference.',
    'INFP': 'The Mediator - Creative and values-driven. You seek authenticity and meaning in your work and relationships.',
    'ENFJ': 'The Protagonist - Charismatic and inspiring leaders. You excel at motivating others and building consensus.',
    'ENFP': 'The Campaigner - Enthusiastic and creative with excellent people skills. You inspire others with your energy.',
    'ISTJ': 'The Logistician - Practical and reliable with strong attention to detail. You prefer stability and established methods.',
    'ISFJ': 'The Protector - Warm and caring with a strong sense of duty. You focus on helping others and maintaining harmony.',
    'ESTJ': 'The Executive - Efficient and organized natural leaders. You excel at managing projects and people.',
    'ESFJ': 'The Consul - Warm and cooperative with strong social skills. You focus on helping others and building relationships.',
    'ISTP': 'The Virtuoso - Practical and action-oriented problem solvers. You prefer hands-on work and learning by doing.',
    'ISFP': 'The Adventurer - Gentle and caring with strong personal values. You seek harmony and authentic expression.',
    'ESTP': 'The Entrepreneur - Energetic and practical with excellent people skills. You thrive in dynamic environments.',
    'ESFP': 'The Entertainer - Enthusiastic and spontaneous with strong social skills. You enjoy being around people and having fun.'
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
    const scoreCount = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    Object.values(finalAnswers).forEach(value => {
      scoreCount[value]++;
    });

    const type = 
      (scoreCount.E > scoreCount.I ? 'E' : 'I') +
      (scoreCount.S > scoreCount.N ? 'S' : 'N') +
      (scoreCount.T > scoreCount.F ? 'T' : 'F') +
      (scoreCount.J > scoreCount.P ? 'J' : 'P');

    setPersonalityType(type);
    setScores(scoreCount);
    setShowResults(true);

    // Call the callback function with the personality data for Firebase storage
    if (onQuizComplete) {
      const personalityData = {
        personalityType: type,
        scores: scoreCount,
        description: personalityDescriptions[type],
        short_description: personalityDescriptions[type].split(' - ')[0],
        completedAt: new Date().toISOString(),
        dimensions: {
          energyOrientation: scoreCount.E > scoreCount.I ? 'Extraversion' : 'Introversion',
          informationProcessing: scoreCount.S > scoreCount.N ? 'Sensing' : 'Intuition',
          decisionMaking: scoreCount.T > scoreCount.F ? 'Thinking' : 'Feeling',
          lifestyle: scoreCount.J > scoreCount.P ? 'Judging' : 'Perceiving'
        }
      };
      onQuizComplete(personalityData);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setPersonalityType('');
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
          colors={['#667eea', '#764ba2']}
          style={styles.gradient}
        >
          <ScrollView contentContainerStyle={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Your Personality Type</Text>
            <Text style={styles.personalityType}>{personalityType}</Text>
            <Text style={styles.description}>
              {personalityDescriptions[personalityType]}
            </Text>
            
            <View style={styles.dimensionsContainer}>
              <View style={styles.dimension}>
                <Text style={styles.dimensionTitle}>
                  {scores.E > scores.I ? 'Extraversion' : 'Introversion'}
                </Text>
                <Text style={styles.dimensionScore}>
                  {Math.max(scores.E, scores.I)} out of 6
                </Text>
              </View>
              
              <View style={styles.dimension}>
                <Text style={styles.dimensionTitle}>
                  {scores.S > scores.N ? 'Sensing' : 'Intuition'}
                </Text>
                <Text style={styles.dimensionScore}>
                  {Math.max(scores.S, scores.N)} out of 6
                </Text>
              </View>
              
              <View style={styles.dimension}>
                <Text style={styles.dimensionTitle}>
                  {scores.T > scores.F ? 'Thinking' : 'Feeling'}
                </Text>
                <Text style={styles.dimensionScore}>
                  {Math.max(scores.T, scores.F)} out of 6
                </Text>
              </View>
              
              <View style={styles.dimension}>
                <Text style={styles.dimensionTitle}>
                  {scores.J > scores.P ? 'Judging' : 'Perceiving'}
                </Text>
                <Text style={styles.dimensionScore}>
                  {Math.max(scores.J, scores.P)} out of 6
                </Text>
              </View>
            </View>
            
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
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Personality Quiz</Text>
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
  personalityType: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  dimensionsContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 30,
  },
  dimension: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  dimensionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  dimensionScore: {
    fontSize: 16,
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
    color: '#667eea',
  },
});

// Updated Firebase integration
const QuizWithFirebase = () => {
  const { currentUser } = useUser(); // Use the current logged-in user

  const handleQuizComplete = async (personalityData) => {
  try {
    const userEmail = currentUser?.email || "test2@example.com";
    const result = await storePersonalityData(userEmail, personalityData);
    
    if (result.success) {
      // Auto-generate profile banners after saving personality data
      await autoGenerateProfileBanners(userEmail);
      
      Alert.alert(
        'Quiz Complete!', 
        `Your personality type (${personalityData.personalityType}) has been saved!`
      );
    } else {
      Alert.alert('Error', result.message);
    }
  } catch (error) {
    console.error('Error saving personality data:', error);
    Alert.alert('Error', 'Failed to save your personality data.');
  }
};

  return <PersonalityQuizScreen onQuizComplete={handleQuizComplete} />;
};

export default QuizWithFirebase;