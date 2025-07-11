import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar, Dimensions, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../contexts/UserContext';
import FaceAvatarPicker from '../components/FaceAvatarPicker';
import FaceAvatarDisplay from '../components/FaceAvatarDisplay';
import { 
    getUserWithPersonality, 
    storeSelectedBanners, 
    storeProfileBackgroundColor, 
    calculateAge, 
    storeSelectedWidgets,
    initializeWidgetData,
    storeUserAvatar,
    getUserAvatar
} from '../backend/UserService';

const { height } = Dimensions.get('window');

export default function EditProfileScreen({ navigation, selectedColor = '#e3f2fd', onColorChange }) {
    // State variables
    const [selectedAvatar, setSelectedAvatar] = useState('happy');
    const [currentBgColor, setCurrentBgColor] = useState(selectedColor);
    const [personalityData, setPersonalityData] = useState(null);
    const [lifestyleData, setLifestyleData] = useState(null);
    const [availableBanners, setAvailableBanners] = useState([]);
    const [selectedBanners, setSelectedBanners] = useState([]);
    const [quizStatus, setQuizStatus] = useState({ personality: false, lifestyle: false });
    const [userName, setUserName] = useState('Loading...');
    const [userAge, setUserAge] = useState('Loading...');
    const [originalBgColor, setOriginalBgColor] = useState(selectedColor);
    const [originalAvatar, setOriginalAvatar] = useState('happy');
    const { currentUser } = useUser();
    const [availableWidgets, setAvailableWidgets] = useState([]);
    const [selectedWidgets, setSelectedWidgets] = useState([]);

    // Color options
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

    // Helper function to generate banners from quiz data
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

    // Load user data on component mount
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userEmail = currentUser?.email;
                if (!userEmail) {
                    console.log("No user logged in");
                    setUserName("Not Logged In");
                    setUserAge("N/A");
                    return;
                }

                // Load user data including avatar
                const personalityResult = await getUserWithPersonality(userEmail);
                
                let personalityQuizData = null;
                let lifestyleQuizData = null;

                if (personalityResult.success && personalityResult.user) {
                    personalityQuizData = personalityResult.user.personalityData;
                    lifestyleQuizData = personalityResult.user.personalityLifestyleData;

                    if (personalityResult.user.firstName && personalityResult.user.lastName) {
                        setUserName(`${personalityResult.user.firstName} ${personalityResult.user.lastName}`);
                    } else {
                        setUserName("Unknown User");
                    }

                    if (personalityResult.user.birthDate) {
                        try {
                            const age = calculateAge(personalityResult.user.birthDate);
                            if (age && !isNaN(age) && age > 0) {
                                setUserAge(age.toString());
                            } else {
                                setUserAge("N/A");
                            }
                        } catch (ageError) {
                            console.error("Error calculating age:", ageError);
                            setUserAge("N/A");
                        }
                    } else {
                        setUserAge("N/A");
                    }

                    if (personalityResult.user.profileBackgroundColor) {
                        setCurrentBgColor(personalityResult.user.profileBackgroundColor);
                        setOriginalBgColor(personalityResult.user.profileBackgroundColor);
                        await AsyncStorage.setItem('profileBackgroundColor', personalityResult.user.profileBackgroundColor);
                    } else {
                        setOriginalBgColor(currentBgColor);
                    }

                    // Load selected widgets
                    const savedWidgets = personalityResult.user.selectedWidgets;
                    if (savedWidgets && savedWidgets.length > 0) {
                        setSelectedWidgets(savedWidgets);
                    } else {
                        setSelectedWidgets(['travel', 'tvshows', 'books', 'fitness']);
                    }
                }

                // Load avatar from the main user data instead of separate call
                if (personalityResult.user.avatarType) {
                    setSelectedAvatar(personalityResult.user.avatarType);
                    setOriginalAvatar(personalityResult.user.avatarType);
                } else {
                    setSelectedAvatar('happy');
                    setOriginalAvatar('happy');
                }

                // Define available widgets
                const widgets = [
                    {
                        id: 'travel',
                        name: 'Travel Dreams',
                        description: 'Places you\'ve been and want to visit',
                        emoji: '✈️',
                        color: ['#667eea', '#764ba2']
                    },
                    {
                        id: 'movies',
                        name: 'Movie Taste',
                        description: 'Your favorite films and reviews',
                        emoji: '🎬',
                        color: ['#ff6b6b', '#feca57']
                    },
                    {
                        id: 'books',
                        name: 'Book Shelf',
                        description: 'Reading list and book reviews',
                        emoji: '📖',
                        color: ['#03af92', '#eef736']
                    },
                    {
                        id: 'foodie',
                        name: 'Foodie Spots',
                        description: 'Restaurants and culinary adventures',
                        emoji: '🍽️',
                        color: ['#e74c3c', '#f39c12']
                    },
                    {
                        id: 'tvshows',
                        name: 'TV Shows',
                        description: 'Shows you\'ve watched and want to watch',
                        emoji: '📺',
                        color: ['#2c3e50', '#3498db']
                    },
                    {
                        id: 'fitness',
                        name: 'Fitness Goals',
                        description: 'Workouts and health achievements',
                        emoji: '💪',
                        color: ['#11998e', '#38ef7d'],
                    },
                    {
                        id: 'hobbies',
                        name: 'Hobbies & Skills',
                        description: 'Creative pursuits and talents',
                        emoji: '🎨',
                        color: ['#8360c3', '#2ebf91'],
                    },
                    {
                        id: 'goals',
                        name: 'Life Goals',
                        description: 'Dreams and aspirations',
                        emoji: '🎯',
                        color: ['#c61225', '#f5934b'],
                    }
                ];
                setAvailableWidgets(widgets);

                // Generate available banners
                const banners = generateBannersFromData(personalityQuizData, lifestyleQuizData);
                setAvailableBanners(banners);

                const savedBanners = personalityResult.user?.selectedProfileBanners;
                if (savedBanners && savedBanners.length > 0) {
                    setSelectedBanners(savedBanners);
                } else {
                    setSelectedBanners(banners.slice(0, 5));
                }

                setQuizStatus({
                    personality: !!personalityQuizData,
                    lifestyle: !!lifestyleQuizData
                });

            } catch (error) {
                console.error('Error loading user data:', error);
                setUserAge("N/A");
                setUserName("Error Loading");
            }
        };

        loadUserData();
    }, [currentUser]);

    // Handler functions
    const handleColorChange = (color) => {
        setCurrentBgColor(color);
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

    const handleWidgetToggle = async (widget) => {
        if (widget.comingSoon) return;
        
        const userEmail = currentUser?.email;
        if (!userEmail) {
            Alert.alert('Error', 'No user logged in');
            return;
        }
        
        if (selectedWidgets.includes(widget.id)) {
            setSelectedWidgets(selectedWidgets.filter(id => id !== widget.id));
        } else if (selectedWidgets.length < 4) {
            setSelectedWidgets([...selectedWidgets, widget.id]);
            
            try {
                const initResult = await initializeWidgetData(userEmail, widget.id);
                if (initResult.success) {
                    console.log(`Initialized ${widget.id} widget data`);
                }
            } catch (error) {
                console.error(`Error initializing ${widget.id} widget:`, error);
            }
        } else {
            Alert.alert(
                "Maximum Widgets Selected",
                "You can only select 4 widgets. Please deselect one first.",
                [{ text: "OK" }]
            );
        }
    };

    const handleSave = async () => {
        try {
            const userEmail = currentUser?.email;
            if (!userEmail) {
                Alert.alert('Error', 'No user logged in');
                return;
            }
            
            // Save avatar if changed
            if (selectedAvatar !== originalAvatar) {
                const faceOptions = {
                    happy: { id: 'happy', name: 'Happy' },
                    cool: { id: 'cool', name: 'Cool' },
                    curious: { id: 'curious', name: 'Curious' },
                    mischievous: { id: 'mischievous', name: 'Mischievous' },
                    determined: { id: 'determined', name: 'Determined' }
                };
                
                const avatarResult = await storeUserAvatar(userEmail, faceOptions[selectedAvatar]);
                if (avatarResult.success) {
                    console.log("Avatar saved successfully");
                    setOriginalAvatar(selectedAvatar);
                } else {
                    console.error("Failed to save avatar:", avatarResult.message);
                }
            }
            
            // Save selected banners to database
            const bannersResult = await storeSelectedBanners(userEmail, selectedBanners);
            if (bannersResult.success) {
                console.log("Banners saved successfully");
            } else {
                console.error("Failed to save banners:", bannersResult.message);
            }
            
            // Save selected widgets to database
            const widgetsResult = await storeSelectedWidgets(userEmail, selectedWidgets);
            if (widgetsResult.success) {
                console.log("Widgets saved successfully");
                
                for (const widgetId of selectedWidgets) {
                    try {
                        await initializeWidgetData(userEmail, widgetId);
                    } catch (error) {
                        console.error(`Error initializing ${widgetId} widget:`, error);
                    }
                }
            } else {
                console.error("Failed to save widgets:", widgetsResult.message);
            }
            
            // Save background color to database if it changed
            if (currentBgColor !== originalBgColor) {
                const colorResult = await storeProfileBackgroundColor(userEmail, currentBgColor);
                if (colorResult.success) {
                    console.log("Background color saved successfully");
                    await AsyncStorage.setItem('profileBackgroundColor', currentBgColor);
                    setOriginalBgColor(currentBgColor);
                } else {
                    console.error("Failed to save background color:", colorResult.message);
                    Alert.alert("Warning", "Profile saved, but background color failed to save.");
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
        // Revert changes
        setCurrentBgColor(originalBgColor);
        setSelectedAvatar(originalAvatar);
        
        try {
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
                    <TouchableOpacity style={styles.quizButton}
                    onPress={() => navigation.navigate('Home')}>
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

    // Render component
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
                        {/* Avatar Section */}
                        <View style={styles.photoContainer}>
                            <View style={styles.photoFrame}>
                                <FaceAvatarDisplay 
                                    avatarType={selectedAvatar} 
                                    size={170} 
                                    showBorder={true} 
                                />
                            </View>
                        </View>

                        {/* Avatar Selection */}
                        <FaceAvatarPicker 
                            onSelectAvatar={(face) => setSelectedAvatar(face.id)}
                            selectedAvatar={selectedAvatar}
                        />

                        {/* Profile Info */}
                        <View style={styles.profileInfoContainer}>

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

                            <View style={{height:40}} />

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
                        
                        {/* Widget Selection */}
                        <View style={styles.widgetContainer}>
                            <Text style={styles.widgetTitle}>Choose Profile Widgets (Select 4)</Text>
                            
                            <Text style={styles.widgetSubtitle}>
                                Selected: {selectedWidgets.length}/4
                            </Text>

                            <View style={styles.widgetGrid}>
                                {availableWidgets.map((widget) => {
                                    const isSelected = selectedWidgets.includes(widget.id);
                                    const isComingSoon = widget.comingSoon;
                                    
                                    return (
                                        <TouchableOpacity
                                            key={widget.id}
                                            style={[
                                                styles.widgetOption,
                                                isSelected && styles.selectedWidget,
                                                isComingSoon && styles.comingSoonWidget
                                            ]}
                                            onPress={() => handleWidgetToggle(widget)}
                                            disabled={isComingSoon}
                                        >
                                            <LinearGradient
                                                colors={widget.color}
                                                style={[
                                                    styles.widgetGradient,
                                                    isComingSoon && styles.comingSoonGradient
                                                ]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                <View style={styles.widgetContent}>
                                                    <Text style={[
                                                        styles.widgetEmoji,
                                                        isComingSoon && styles.comingSoonText
                                                    ]}>
                                                        {widget.emoji}
                                                    </Text>
                                                    <Text style={[
                                                        styles.widgetName,
                                                        isComingSoon && styles.comingSoonText
                                                    ]}>
                                                        {widget.name}
                                                    </Text>
                                                    <Text style={[
                                                        styles.widgetDescription,
                                                        isComingSoon && styles.comingSoonText
                                                    ]}>
                                                        {widget.description}
                                                    </Text>
                                                    {isComingSoon && (
                                                        <Text style={styles.comingSoonLabel}>
                                                            Coming Soon
                                                        </Text>
                                                    )}
                                                </View>
                                                {isSelected && !isComingSoon && (
                                                    <View style={styles.selectedWidgetCheckmark}>
                                                        <Text style={styles.widgetCheckmarkText}>✓</Text>
                                                    </View>
                                                )}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    );
                                })}
                                <View style={{bottom: 30, height:20}}/>
                            </View>
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
        justifyContent: 'center',
        alignItems: 'center',
        left: 0,
    },
    profileInfoContainer: { flex: 1, marginTop: 23, paddingBottom: 50 },
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
    
    // Widget selection styles
    widgetContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    widgetTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    widgetSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    widgetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
        paddingBottom: 10,
        marginBottom: 0,
    },
    widgetOption: {
        width: '48%',
        borderRadius: 15,
        marginBottom: 15,
    },
    selectedWidget: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 8,
    },
    widgetGradient: {
        padding: 16,
        minHeight: 120,
        position: 'relative',
        borderRadius: 15,
        overflow: 'hidden',
    },
    comingSoonWidget: {
        opacity: 0.6,
    },
    comingSoonGradient: {
        opacity: 0.7,
    },
    widgetContent: {
        alignItems: 'center',
        flex: 1,
    },
    widgetEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    widgetName: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
        marginBottom: 4,
    },
    widgetDescription: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 14,
    },
    comingSoonText: {
        opacity: 0.8,
    },
    comingSoonLabel: {
        fontSize: 10,
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginTop: 4,
    },
    selectedWidgetCheckmark: {
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
    widgetCheckmarkText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});