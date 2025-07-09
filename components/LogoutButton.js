import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LogoutButton({ overrideTop }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation();
  const { logout } = useUser();
  const insets = useSafeAreaInsets();

  const handleCirclePress = () => {
    if (isExpanded) {
      // Close the popup
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsExpanded(false);
      });
    } else {
      // Open the popup
      setIsExpanded(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleLogout = () => {
    // Close the popup first, then show Alert
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsExpanded(false);

      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: () => {
              logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ]
      );
    });
  };

  return (
    <>
      {isExpanded && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={handleCirclePress}
          activeOpacity={1}
        />
      )}

      <View style={[styles.container, { top: overrideTop ?? insets.top + 10, left: 10 }]}>
        <TouchableOpacity
          style={[styles.circle, isExpanded && styles.circleExpanded]}
          onPress={handleCirclePress}
          activeOpacity={0.8}
        >
          <Text style={styles.circleText}>
            {isExpanded ? '×' : '⋯'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <Animated.View
            style={[
              styles.popup,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10000,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  circleExpanded: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  circleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  popup: {
  position: 'absolute',
  top: 50,
  left: 0,
  backgroundColor: 'white',
  borderRadius: 12,
  minWidth: 120, // ← ADDED: make popup larger
  paddingVertical: 10,
  paddingHorizontal: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 8,
  borderWidth: 1,
  borderColor: 'rgba(0, 0, 0, 0.1)',
  zIndex: 10001,
},
logoutButton: {
  paddingVertical: 10,
  paddingHorizontal: 12,
  alignItems: 'center',
},
logoutText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#e74c3c',
},
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: 'transparent',
  },
});
