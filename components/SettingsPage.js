import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { useUser } from '../contexts/UserContext';
import { getUserWithPersonality, storeLocationSettings } from '../backend/UserService';

export default function SettingsPage() {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [genderPreference, setGenderPreference] = useState('Both');
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser();

  useEffect(() => {
    loadUserSettings();
  }, []);

  const getDefaultGenderPreference = (userGender, userSexualOrientation) => {
    if (!userSexualOrientation) return 'Both';
    
    const orientation = userSexualOrientation.toLowerCase();
    const gender = userGender?.toLowerCase();
    
    if (orientation === 'straight') {
      if (gender === 'male') return 'Female';
      if (gender === 'female') return 'Male';
      return 'Both'; // For other genders
    } else if (orientation === 'gay') {
      if (gender === 'male') return 'Male';
      if (gender === 'female') return 'Female';
      return 'Both'; // For other genders
    } else if (orientation === 'bisexual') {
      return 'Both';
    } else {
      return 'Both'; // For other orientations
    }
  };

  const loadUserSettings = async () => {
    try {
      const userEmail = currentUser?.email || "test2@example.com";
      const result = await getUserWithPersonality(userEmail);
      
      if (result.success && result.user) {
        // Load location settings
        if (result.user.locationSettings) {
          const settings = result.user.locationSettings;
          setLocationEnabled(settings.enabled || false);
          setRadiusMiles(settings.radiusMiles || 25);
          
          // Load gender preference or set default
          if (settings.genderPreference) {
            setGenderPreference(settings.genderPreference);
          } else {
            // Set default based on user's sexual orientation
            const defaultPref = getDefaultGenderPreference(
              result.user.gender, 
              result.user.sexualOrientation
            );
            setGenderPreference(defaultPref);
          }
        } else {
          // No location settings exist, set default gender preference
          const defaultPref = getDefaultGenderPreference(
            result.user.gender, 
            result.user.sexualOrientation
          );
          setGenderPreference(defaultPref);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading user settings:', error);
      setLoading(false);
    }
  };

  const updateGenderPreference = async (preference) => {
    try {
      const userEmail = currentUser?.email || "test2@example.com";
      const userData = await getUserWithPersonality(userEmail);
      
      let updatedSettings = {
        enabled: locationEnabled,
        radiusMiles: radiusMiles,
        genderPreference: preference,
        lastUpdated: new Date().toISOString()
      };

      // Preserve existing location data if available
      if (userData.success && userData.user.locationSettings) {
        updatedSettings = {
          ...userData.user.locationSettings,
          genderPreference: preference,
          lastUpdated: new Date().toISOString()
        };
      }

      const result = await storeLocationSettings(userEmail, updatedSettings);
      
      if (result.success) {
        setGenderPreference(preference);
      } else {
        Alert.alert('Error', 'Failed to update gender preference.');
      }
    } catch (error) {
      console.error('Error updating gender preference:', error);
      Alert.alert('Error', 'Failed to update gender preference.');
    }
  };

  const handleLocationToggle = async () => {
    if (!locationEnabled) {
      // Request location permission
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location access is required to find people near you.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Get current location
        let location = await Location.getCurrentPositionAsync({});
        
        const locationData = {
          enabled: true,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          radiusMiles: radiusMiles,
          genderPreference: genderPreference,
          lastUpdated: new Date().toISOString()
        };

        // Save to database
        const userEmail = currentUser?.email || "test2@example.com";
        const result = await storeLocationSettings(userEmail, locationData);
        
        if (result.success) {
          setLocationEnabled(true);
          Alert.alert(
            'Location Enabled',
            `You can now discover people within ${radiusMiles} miles of your location!`
          );
        } else {
          Alert.alert('Error', 'Failed to save location settings.');
        }
      } catch (error) {
        console.error('Error enabling location:', error);
        Alert.alert('Error', 'Failed to get your location.');
      }
    } else {
      // Disable location
      const locationData = {
        enabled: false,
        latitude: null,
        longitude: null,
        radiusMiles: radiusMiles,
        genderPreference: genderPreference,
        lastUpdated: new Date().toISOString()
      };

      const userEmail = currentUser?.email || "test2@example.com";
      const result = await storeLocationSettings(userEmail, locationData);
      
      if (result.success) {
        setLocationEnabled(false);
        Alert.alert('Location Disabled', 'Location services have been turned off.');
      } else {
        Alert.alert('Error', 'Failed to update location settings.');
      }
    }
  };

  const handleRadiusChange = async (value) => {
    setRadiusMiles(Math.round(value));
    
    // Update radius in database if location is enabled
    if (locationEnabled) {
      try {
        const userEmail = currentUser?.email || "test2@example.com";
        const userData = await getUserWithPersonality(userEmail);
        
        if (userData.success && userData.user.locationSettings) {
          const updatedSettings = {
            ...userData.user.locationSettings,
            radiusMiles: Math.round(value),
            lastUpdated: new Date().toISOString()
          };
          
          await storeLocationSettings(userEmail, updatedSettings);
        }
      } catch (error) {
        console.error('Error updating radius:', error);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Gender Preference Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💕 Gender Preference</Text>
          </View>
          
          <Text style={styles.preferenceDescription}>
            Choose which genders you'd like to see in your discovery feed
          </Text>
          
          <View style={styles.genderOptionsContainer}>
            {['Male', 'Female', 'Both'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderOption,
                  genderPreference === option && styles.genderOptionSelected
                ]}
                onPress={() => updateGenderPreference(option)}
              >
                <Text style={[
                  styles.genderOptionText,
                  genderPreference === option && styles.genderOptionTextSelected
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location Services Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 Location Services</Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Location Services</Text>
              <Text style={styles.settingDescription}>
                Find people near you based on your location
              </Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor={locationEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {/* Radius Slider - Only show if location is enabled */}
          {locationEnabled && (
            <View style={styles.radiusContainer}>
              <Text style={styles.radiusLabel}>
                Discovery Radius: {radiusMiles} miles
              </Text>
              <Text style={styles.radiusDescription}>
                Meet people within this distance from your location
              </Text>
              
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>1 mile</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={100}
                  value={radiusMiles}
                  onValueChange={handleRadiusChange}
                  minimumTrackTintColor="#007AFF"
                  maximumTrackTintColor="#e0e0e0"
                  thumbStyle={styles.sliderThumb}
                  step={1}
                />
                <Text style={styles.sliderLabel}>100 miles</Text>
              </View>
            </View>
          )}
        </View>

        {/* Status Info */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>
            Current Preferences
          </Text>
          <Text style={styles.statusDescription}>
            Gender: {genderPreference}
            {'\n'}
            Location: {locationEnabled 
              ? `Enabled (${radiusMiles} miles)`
              : 'Disabled'
            }
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 18,
  },
  genderOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  genderOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  genderOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  genderOptionTextSelected: {
    color: '#ffffff',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  radiusContainer: {
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  radiusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  radiusDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  sliderThumb: {
    backgroundColor: '#007AFF',
    width: 20,
    height: 20,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});