import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, StatusBar, Dimensions, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserWithPersonality, storeSelectedBanners, uploadProfilePhoto, storeProfileBackgroundColor, calculateAge } from '../backend/UserService';
import { useUser } from '../contexts/UserContext';
import * as ImagePicker from 'expo-image-picker';

const { height } = Dimensions.get('window');

export default function EditProfileScreen({ navigation, selectedColor = '#e3f2fd', onColorChange }) {
    const [photoUrl, setPhotoUrl] = useState('');
    const [currentBgColor, setCurrentBgColor] = useState(selectedColor);
    const [personalityData, setPersonalityData] = useState(null);
    const [lifestyleData, setLifestyleData] = useState(null);
    const [availableBanners, setAvailableBanners] = useState([]);
    const [selectedBanners, setSelectedBanners] = useState([]);
    const [quizStatus, setQuizStatus] = useState({ personality: false, lifestyle: false });
    const [uploading, setUploading] = useState(false);
    const [userName, setUserName] = useState('Sarah Johnson');
    const [userAge, setUserAge] = useState('24');
    const [originalBgColor, setOriginalBgColor] = useState(selectedColor); // Store original color
    const { currentUser } = useUser();

    const colorOptions = [
        { name: 'Light Blue', color: '#e3f2fd', id: 1 },
        { name: 'Lavender', color: '#f3e5f5', id: 2 },
        { name: 'Light Green', color: '#e8f5e8', id: 3 },
        { name: 'Peach', color: '#ffeaa7', id: 4 },
        { name: 'Light Pink', color: '#ffedef', id: 5 },
        { name: 'Light Orange', color: '#ffe4cc', id: 6 },
        { name: 'Mint', color: '#d1f2eb', id: 7 },
        { name: 'Light Yellow', color: '#fff9c4', id: 8 },
    ];

    const generateBannersFromData = (personalityData, lifestyleData) => {
        const banners = [];

        // Personality quiz banners
        if (personalityData) {
            banners.push({
                id: 'personality_type',
                label: 'Personality Type',
                value: personalityData.short_description || personalityData.personalityType,
                gradient: ['#667eea', '#764ba2'],
                textColor: 'white'
            });

            if (personalityData.dimensions) {
                banners.push({
                    id: 'energy_style',
                    label: 'Energy Style',
                    value: personalityData.dimensions.energyOrientation,
                    gradient: ['#a8edea', '#fed6e3'],
                    textColor: '#333'
                });

                banners.push({
                    id: 'decision_style',
                    label: 'Decision Style',
                    value: personalityData.dimensions.decisionMaking,
                    gradient: ['#d299c2', '#fef9d7'],
                    textColor: '#333'
                });
            }
        }

        // Lifestyle quiz banners
        if (lifestyleData && lifestyleData.preferences) {
            const prefs = lifestyleData.preferences;

            banners.push({
                id: 'candy_choice',
                label: 'Candy Choice',
                value: prefs.candy === 0 ? 'Skittles 🌈' : 'M&Ms 🍫',
                gradient: ['#ffecd2', '#fcb69f'],
                textColor: '#333'
            });

            banners.push({
                id: 'time_preference',
                label: 'Time Preference',
                value: prefs.time_of_day === 0 ? 'Morning Person 🌅' : 'Night Owl 🦉',
                gradient: ['#ff9a9e', '#fecfef'],
                textColor: '#333'
            });

            banners.push({
                id: 'pet_preference',
                label: 'Pet Preference',
                value: prefs.pets === 0 ? 'Cat Person 🐱' : 'Dog Person 🐶',
                gradient: ['#a8edea', '#fed6e3'],
                textColor: '#333'
            });

            banners.push({
                id: 'drink_choice',
                label: 'Drink Choice',
                value: prefs.drink === 0 ? 'Coffee Lover ☕' : 'Tea Enthusiast 🍵',
                gradient: ['#d299c2', '#fef9d7'],
                textColor: '#333'
            });

            banners.push({
                id: 'home_style',
                label: 'Dream Home',
                value: prefs.home === 0 ? 'Cozy Cottage 🏠' : 'Grand Mansion 🏰',
                gradient: ['#ff9a9e', '#fecfef'],
                textColor: '#333'
            });

            banners.push({
                id: 'social_style',
                label: 'Social Style',
                value: prefs.friday_night === 0 ? 'Party Starter 🕺' : 'Movie Night 🍿',
                gradient: ['#667eea', '#764ba2'],
                textColor: 'white'
            });

            banners.push({
                id: 'vacation_style',
                label: 'Vacation Style',
                value: prefs.vacation === 0 ? 'Beach Lover 🏖️' : 'Mountain Explorer ⛰️',
                gradient: ['#ffecd2', '#fcb69f'],
                textColor: '#333'
            });

            banners.push({
                id: 'organization',
                label: 'Organization',
                value: prefs.organization === 0 ? 'Super Organized ✨' : 'Creative Chaos 🌪️',
                gradient: ['#a8edea', '#fed6e3'],
                textColor: '#333'
            });
        }

        return banners;
    };

    const getProfilePhoto = async () => {
        try {
            // First try to load user's saved photo from database
            const userEmail = "test2@example.com"; // Replace with actual user email
            const result = await getUserWithPersonality(userEmail);
            
            if (result.success && result.user && result.user.profilePhotoURL) {
                return result.user.profilePhotoURL;
            } else {
                // Fallback to random photo
                const response = await fetch("https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face");
                return response.url;
            }
        } catch (error) {
            console.error("Error loading profile photo:", error);
            const response = await fetch("https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face");
            return response.url;
        }
    };

    useEffect(() => {
        const loadPhoto = async () => {
            const url = await getProfilePhoto();
            setPhotoUrl(url);
        };
        loadPhoto();
    }, []);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userEmail = currentUser?.email || "test2@example.com"; // Use current user or fallback
                
                // Load personality data
                const personalityResult = await getUserWithPersonality(userEmail);
                let personalityQuizData = null;
                let lifestyleQuizData = null;

                if (personalityResult.success && personalityResult.user) {
                    personalityQuizData = personalityResult.user.personalityData;
                    lifestyleQuizData = personalityResult.user.personalityLifestyleData;
                    
                    // Load user name and age
                    if (personalityResult.user.firstName && personalityResult.user.lastName) {
                        setUserName(`${personalityResult.user.firstName} ${personalityResult.user.lastName}`);
                    }
                    
                    if (personalityResult.user.birthDate) {
                        const age = calculateAge(personalityResult.user.birthDate);
                        setUserAge(age.toString());
                    }
                    
                    // Load saved background color from database
                    if (personalityResult.user.profileBackgroundColor) {
                        setCurrentBgColor(personalityResult.user.profileBackgroundColor);
                        setOriginalBgColor(personalityResult.user.profileBackgroundColor); // Store as original
                        // Also save to AsyncStorage for faster loading
                        await AsyncStorage.setItem('profileBackgroundColor', personalityResult.user.profileBackgroundColor);
                    } else {
                        setOriginalBgColor(currentBgColor); // Store current as original
                    }
                }

                setPersonalityData(personalityQuizData);
                setLifestyleData(lifestyleQuizData);
                
                setQuizStatus({
                    personality: !!personalityQuizData,
                    lifestyle: !!lifestyleQuizData
                });

                // Generate available banners
                const banners = generateBannersFromData(personalityQuizData, lifestyleQuizData);
                setAvailableBanners(banners);

                // Set default selected banners (first 5)
                const savedBanners = personalityResult.user.selectedProfileBanners;
                if (savedBanners && savedBanners.length > 0) {
                    setSelectedBanners(savedBanners);
                } else {
                    setSelectedBanners(banners.slice(0, 5));
                }

            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();
    }, []);

    const handleColorChange = (color) => {
        // Only change the UI color, don't save to database or AsyncStorage yet
        setCurrentBgColor(color);
        
        // Update parent component for immediate UI feedback if needed
        if (onColorChange) {
            onColorChange(color);
        }
    };

    const handleBannerToggle = (banner) => {
        if (selectedBanners.find(b => b.id === banner.id)) {
            setSelectedBanners(selectedBanners.filter(b => b.id !== banner.id));
        } else if (selectedBanners.length < 5) {
            setSelectedBanners([...selectedBanners, banner]);
        }
    };

    const handlePhotoEdit = async () => {
        try {
            // Request permission to access camera roll
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (permissionResult.granted === false) {
                Alert.alert("Permission Required", "You need to allow camera roll access to change your photo.");
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], // Square aspect ratio
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setUploading(true);
                
                // Upload photo to Firebase
                const userEmail = "test2@example.com"; // Replace with actual user email
                const uploadResult = await uploadProfilePhoto(userEmail, result.assets[0].uri);
                
                if (uploadResult.success) {
                    setPhotoUrl(uploadResult.photoURL);
                    Alert.alert("Success", "Profile photo updated!");
                } else {
                    Alert.alert("Error", uploadResult.message);
                }
                
                setUploading(false);
            }
        } catch (error) {
            console.error("Error selecting photo:", error);
            Alert.alert("Error", "Failed to select photo.");
            setUploading(false);
        }
    };

    const handleSave = async () => {
    try {
        const userEmail = currentUser?.email || "test2@example.com";
        
        // Save selected banners to database
        const bannersResult = await storeSelectedBanners(userEmail, selectedBanners);
        
        if (bannersResult.success) {
            console.log("Banners saved successfully");
        } else {
            console.error("Failed to save banners:", bannersResult.message);
        }
        
        // Save background color to database if it changed
        if (currentBgColor !== originalBgColor) {
            const colorResult = await storeProfileBackgroundColor(userEmail, currentBgColor);
            
            if (colorResult.success) {
                console.log("Background color saved successfully");
                // Update AsyncStorage after successful database save
                await AsyncStorage.setItem('profileBackgroundColor', currentBgColor);
                // Update the original color so it doesn't revert next time
                setOriginalBgColor(currentBgColor);
            } else {
                console.error("Failed to save background color:", colorResult.message);
                // Optionally show an alert about the failure
                Alert.alert("Warning", "Profile banners saved, but background color failed to save.");
            }
        }
        
    } catch (error) {
        console.error("Error saving profile data:", error);
        Alert.alert("Error", "Failed to save some profile changes.");
    }

    if (navigation) {
        navigation.goBack();
    }
};

    const handleCancel = async () => {
        // Revert background color to original
        setCurrentBgColor(originalBgColor);
        
        try {
            // Only revert AsyncStorage if we actually changed something
            if (currentBgColor !== originalBgColor) {
                await AsyncStorage.setItem('profileBackgroundColor', originalBgColor);
                if (onColorChange) {
                    onColorChange(originalBgColor);
                }
            }
        } catch (e) {
            console.error('[ERROR] Failed to revert AsyncStorage', e);
        }
        if (navigation) {
            navigation.goBack();
        }
    };


    const renderQuizPrompt = () => {
        if (!quizStatus.personality && !quizStatus.lifestyle) {
            return (
                <View style={styles.quizPromptContainer}>
                    <Text style={styles.quizPromptTitle}>Complete Quizzes to Unlock Banners! 🎯</Text>
                    <Text style={styles.quizPromptText}>
                        Take our personality and lifestyle quizzes to unlock personalized profile banners that show off your unique traits!
                    </Text>
                    <TouchableOpacity style={styles.quizButton}>
                        <Text style={styles.quizButtonText}>Take Quizzes</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (quizStatus.personality && !quizStatus.lifestyle) {
            return (
                <View style={styles.incompleteQuizContainer}>
                    <Text style={styles.incompleteQuizText}>
                        Take more quizzes to better express yourself to others! ✨
                    </Text>
                </View>
            );
        }

        if (!quizStatus.personality && quizStatus.lifestyle) {
            return (
                <View style={styles.incompleteQuizContainer}>
                    <Text style={styles.incompleteQuizText}>
                        Take more quizzes to better express yourself to others! 🌟
                    </Text>
                </View>
            );
        }

        return null;
    };

    return (
        <View style={styles.fullContainer}>
            <StatusBar backgroundColor={currentBgColor} barStyle="dark-content" />
            <SafeAreaView style={[styles.safeArea, { backgroundColor: currentBgColor }]}>
                <LinearGradient
                    colors={[currentBgColor, '#ffffff']}
                    style={styles.container}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                >
                    {/* Header with Save Button */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContainer}>
                        {/* Photo Section with Edit Icon */}
                        <View style={styles.photoContainer}>
                            <View style={styles.photoFrame}>
                                {photoUrl ? (
                                    <Image source={{ uri: photoUrl }} style={{ width: '100%', height: '100%' }} />
                                ) : (
                                    <View style={styles.loadingText}>
                                        <Text>{uploading ? "Uploading..." : "Loading..."}</Text>
                                    </View>
                                )}
                                <TouchableOpacity 
                                    style={[styles.editPhotoIcon, uploading && styles.disabledIcon]} 
                                    onPress={handlePhotoEdit}
                                    disabled={uploading}
                                >
                                    <Text style={styles.editPhotoIconText}>
                                        {uploading ? "..." : "✎"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Profile Info */}
                        <View style={styles.profileInfoContainer}>
                            <View style={styles.profileInfoNameContainer}>
                                <TouchableOpacity style={styles.editableField}>
                                    <Text style={styles.nameText}>{userName}</Text>
                                    <Text style={styles.editHint}>Tap to edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.editableField}>
                                    <Text style={styles.ageText}>{userAge}</Text>
                                    <Text style={styles.editHint}>Tap to edit</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Background Color Picker */}
                            <View style={styles.colorPickerContainer}>
                                <Text style={styles.colorPickerTitle}>Choose Background Color</Text>
                                <View style={styles.colorOptionsContainer}>
                                    {colorOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[
                                                styles.colorOption,
                                                { backgroundColor: option.color },
                                                currentBgColor === option.color && styles.selectedColorOption
                                            ]}
                                            onPress={() => handleColorChange(option.color)}
                                        >
                                            {currentBgColor === option.color && (
                                                <Text style={styles.selectedIcon}>✓</Text>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Quiz Prompt or Banner Selection */}
                            {(!quizStatus.personality && !quizStatus.lifestyle) ? (
                                renderQuizPrompt()
                            ) : (
                                <View style={styles.bannerContainer}>
                                    <Text style={styles.bannerTitle}>Choose Profile Banners (Select up to 5)</Text>
                                    
                                    {renderQuizPrompt()}

                                    <Text style={styles.bannerSubtitle}>
                                        Selected: {selectedBanners.length}/5
                                    </Text>

                                    <View style={styles.bannerGrid}>
                                        {availableBanners.map((banner) => {
                                            const isSelected = selectedBanners.find(b => b.id === banner.id);
                                            return (
                                                <TouchableOpacity
                                                    key={banner.id}
                                                    style={[
                                                        styles.bannerOption,
                                                        isSelected && styles.selectedBanner
                                                    ]}
                                                    onPress={() => handleBannerToggle(banner)}
                                                    disabled={!isSelected && selectedBanners.length >= 5}
                                                >
                                                    <LinearGradient
                                                        colors={banner.gradient}
                                                        style={styles.bannerGradient}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 1 }}
                                                    >
                                                        <View style={styles.bannerContent}>
                                                            <Text style={[
                                                                styles.bannerLabel,
                                                                { color: banner.textColor }
                                                            ]}>
                                                                {banner.label}
                                                            </Text>
                                                            <Text style={[
                                                                styles.bannerValue,
                                                                { color: banner.textColor }
                                                            ]}>
                                                                {banner.value}
                                                            </Text>
                                                        </View>
                                                        {isSelected && (
                                                            <View style={styles.selectedCheckmark}>
                                                                <Text style={styles.checkmarkText}>✓</Text>
                                                            </View>
                                                        )}
                                                    </LinearGradient>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: '#e3f2fd' },
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scrollContainer: { flex: 1 },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    cancelButton: { padding: 8 },
    cancelText: { fontSize: 16, color: '#666', fontWeight: '500' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    saveButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    saveText: { fontSize: 16, color: 'white', fontWeight: '600' },
    photoContainer: { height: 200, width: '100%', alignItems: 'center', paddingTop: 20 },
    photoFrame: {
        width: 170,
        height: 170,
        borderRadius: 100,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#ddd',
        position: 'relative',
    },
    editPhotoIcon: {
        position: 'absolute',
        bottom: 60,
        right: 60,
        backgroundColor: 'rgba(0,0,0,0.7)',
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    editPhotoIconText: { 
        color: 'white', 
        fontSize: 12, 
        fontWeight: 'bold',
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    loadingText: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    profileInfoContainer: { flex: 1, marginTop: 23, paddingBottom: 50 },
    profileInfoNameContainer: { alignItems: 'center', marginBottom: 20 },
    editableField: { alignItems: 'center', padding: 8, borderRadius: 8, marginBottom: 10 },
    nameText: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 2 },
    ageText: { fontSize: 18, color: '#666', marginBottom: 2 },
    editHint: { fontSize: 12, color: '#999', fontStyle: 'italic' },
    colorPickerContainer: { paddingHorizontal: 20, marginBottom: 30 },
    colorPickerTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 15, textAlign: 'center' },
    colorOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    colorOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedColorOption: { borderColor: '#007AFF', borderWidth: 3 },
    selectedIcon: { color: '#333', fontSize: 20, fontWeight: 'bold' },
    
    // Quiz prompt styles
    quizPromptContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
        alignItems: 'center',
    },
    quizPromptTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 15,
    },
    quizPromptText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    quizButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    quizButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    incompleteQuizContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    incompleteQuizText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        padding: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 193, 7, 0.3)',
    },
    
    // Banner selection styles
    bannerContainer: {
        paddingHorizontal: 20,
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    bannerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    bannerGrid: {
        gap: 12,
    },
    bannerOption: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 8,
    },
    selectedBanner: {
        borderWidth: 3,
        borderColor: '#007AFF',
    },
    bannerGradient: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    bannerContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bannerLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    bannerValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    selectedCheckmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledIcon: {
        opacity: 0.5,
    },
});