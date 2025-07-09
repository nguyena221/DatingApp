import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsPage from './SettingsPage';
import LogoutButton from '../components/LogoutButton';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../backend/FirebaseConfig';
import { calculateAge } from '../backend/UserService';
import { useUser } from '../contexts/UserContext';

const { width } = Dimensions.get('window');
const RootStack = createStackNavigator();

export default function DiscoverPage({ navigation }) {
    const [currentProfile, setCurrentProfile] = useState(null);
    const [profileQueue, setProfileQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useUser();
    
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    // Load profiles from database
    const loadProfiles = async () => {
        try {
            const usersCollection = collection(db, 'users');
            const snapshot = await getDocs(usersCollection);
            const profiles = [];
            
            snapshot.forEach((doc) => {
                const userData = doc.data();
                // Don't include current user in discovery
                if (userData.email !== currentUser?.email) {
                    profiles.push({
                        id: doc.id,
                        ...userData
                    });
                }
            });
            
            // Shuffle profiles for variety
            const shuffledProfiles = profiles.sort(() => Math.random() - 0.5);
            setProfileQueue(shuffledProfiles);
            
            if (shuffledProfiles.length > 0) {
                setCurrentProfile(shuffledProfiles[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading profiles:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfiles();
    }, [currentUser]);

    const loadNextProfile = () => {
        try {
            console.log('Loading next profile. Current queue length:', profileQueue.length);
            
            if (profileQueue.length > 1) {
                const newQueue = profileQueue.slice(1);
                setProfileQueue(newQueue);
                setCurrentProfile(newQueue[0] || null);
                console.log('Next profile loaded:', newQueue[0]?.firstName || 'Unknown');
            } else {
                console.log('Queue empty, reloading profiles...');
                // Reload profiles when we run out
                setCurrentProfile(null);
                loadProfiles();
            }
        } catch (error) {
            console.error('Error in loadNextProfile:', error);
            // Fallback: reload all profiles
            loadProfiles();
        }
    };

    const panGestureEvent = useAnimatedGestureHandler({
        onStart: (event, context) => {
            context.translateX = translateX.value;
            context.translateY = translateY.value;
            scale.value = withSpring(1.05); // Slight scale up when grabbed
        },
        onActive: (event, context) => {
            translateX.value = event.translationX + context.translateX;
            translateY.value = event.translationY + context.translateY;
        },
        onEnd: (event) => {
            try {
                const shouldSwipe = Math.abs(translateX.value) > width * 0.3;
                
                if (shouldSwipe) {
                    // Swipe off screen
                    translateX.value = withSpring(translateX.value > 0 ? width : -width);
                    translateY.value = withSpring(translateY.value);
                    scale.value = withSpring(0.8);
                    
                    // Load next profile after animation
                    setTimeout(() => {
                        translateX.value = 0;
                        translateY.value = 0;
                        scale.value = 1; // Remove withSpring here to avoid issues
                        runOnJS(loadNextProfile)();
                    }, 300);
                } else {
                    // Spring back to center
                    translateX.value = withSpring(0);
                    translateY.value = withSpring(0);
                    scale.value = withSpring(1);
                }
            } catch (error) {
                console.error('Error in gesture handler:', error);
                // Reset values
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                scale.value = withSpring(1);
            }
        },
    });

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value }
            ]
        };
    });

    const renderProfileCard = () => {
        if (!currentProfile) return null;

        try {
            const age = currentProfile.birthDate ? calculateAge(currentProfile.birthDate) : 'N/A';
            const name = currentProfile.firstName && currentProfile.lastName 
                ? `${currentProfile.firstName} ${currentProfile.lastName}` 
                : 'Anonymous User';
            
            // Get background color or default
            const bgColor = currentProfile.profileBackgroundColor || '#e3f2fd';
            
            // Get profile banners or show message
            const banners = currentProfile.selectedProfileBanners || [];

            return (
                <LinearGradient
                    colors={[bgColor, '#ffffff']}
                    style={styles.profileCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                >
                    {/* Profile Photo */}
                    <View style={styles.photoContainer}>
                        <View style={styles.photoFrame}>
                            {currentProfile.profilePhotoURL ? (
                                <Image
                                    source={{ uri: currentProfile.profilePhotoURL }}
                                    style={styles.profilePhoto}
                                    onError={(error) => console.log('Image load error:', error)}
                                />
                            ) : (
                                <View style={styles.placeholderPhoto}>
                                    <Ionicons name="person" size={60} color="#ccc" />
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Name and Age */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.nameText}>{name}</Text>
                        <Text style={styles.ageText}>{age}</Text>
                    </View>

                    {/* Profile Banners or No Quiz Message */}
                    <View style={styles.bannersContainer}>
                        {banners && banners.length > 0 ? (
                            banners.slice(0, 3).map((banner, index) => (
                                <LinearGradient
                                    key={banner?.id || `banner-${index}`}
                                    colors={banner?.gradient || ['#e3f2fd', '#ffffff']}
                                    style={styles.bannerRow}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={[
                                        styles.bannerLabel,
                                        { color: banner?.textColor || '#333' }
                                    ]}>
                                        {banner?.label || 'Unknown'}
                                    </Text>
                                    <Text style={[
                                        styles.bannerValue,
                                        { color: banner?.textColor || '#333' }
                                    ]}>
                                        {banner?.value || 'N/A'}
                                    </Text>
                                </LinearGradient>
                            ))
                        ) : (
                            <View style={styles.noQuizzesContainer}>
                                <Text style={styles.noQuizzesEmoji}>🎯</Text>
                                <Text style={styles.noQuizzesText}>
                                    This user hasn't completed any quizzes yet
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Swipe Instructions */}
                    <View style={styles.instructionsContainer}>
                        <Text style={styles.instructionsText}>
                            👈 Swipe left or right to discover more profiles 👉
                        </Text>
                    </View>
                </LinearGradient>
            );
        } catch (error) {
            console.error('Error rendering profile card:', error);
            return (
                <View style={[styles.profileCard, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 16, color: '#666' }}>Error loading profile</Text>
                    <TouchableOpacity 
                        style={styles.reloadButton} 
                        onPress={loadProfiles}
                    >
                        <Text style={styles.reloadButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LogoutButton />
            
            {/* Settings button */}
            <TouchableOpacity onPress={() => { navigation.navigate('Settings') }}>
                <View style={styles.topBar}>
                    <Ionicons name="settings-outline" size={25} color="black" />
                </View>
            </TouchableOpacity>

            {/* Header text */}
            <View style={styles.headerContainer}>
                <Text style={styles.text}>Discover</Text>
            </View>

            {/* Profile card */}
            <View style={styles.cardContainer}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading profiles...</Text>
                    </View>
                ) : currentProfile ? (
                    <PanGestureHandler onGestureEvent={panGestureEvent}>
                        <Animated.View style={[rStyle]}>
                            {renderProfileCard()}
                        </Animated.View>
                    </PanGestureHandler>
                ) : (
                    <View style={styles.noProfilesContainer}>
                        <Text style={styles.noProfilesText}>No more profiles to discover!</Text>
                        <TouchableOpacity 
                            style={styles.reloadButton} 
                            onPress={loadProfiles}
                        >
                            <Text style={styles.reloadButtonText}>Reload Profiles</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    topBar: {
        alignItems: 'flex-end',
        height: 30,
        position: 'absolute',
        right: 20
    },
    headerContainer: {
        height: 30,
        alignItems: 'center'
    },
    text: {
        fontFamily: 'Georgia-Italic',
        fontSize: 25,
        color: 'black',
        letterSpacing: 0.38,
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    profileCard: {
        height: 550,
        width: 300,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        padding: 20,
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    photoFrame: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    profilePhoto: {
        width: '100%',
        height: '100%',
    },
    placeholderPhoto: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    ageText: {
        fontSize: 18,
        color: '#666',
    },
    bannersContainer: {
        flex: 1,
        gap: 10,
    },
    bannerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 15,
    },
    bannerLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    bannerValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    noQuizzesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 15,
        padding: 20,
    },
    noQuizzesEmoji: {
        fontSize: 36,
        marginBottom: 10,
    },
    noQuizzesText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    instructionsContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    instructionsText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
    },
    noProfilesContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    noProfilesText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    reloadButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    reloadButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});