import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, StatusBar, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserWithPersonality, calculateAge } from '../backend/UserService';
import { useUser } from '../contexts/UserContext';

const { height } = Dimensions.get('window');

export default function ProfilePageStart({ scrollY }) {
    const [bgColor, setBgColor] = useState('#e3f2fd');
    const [photoUrl, setPhotoUrl] = useState('');
    const [selectedBanners, setSelectedBanners] = useState([]);
    const [userName, setUserName] = useState('Sarah Johnson');
    const [userAge, setUserAge] = useState('24');
    const navigation = useNavigation();
    const { currentUser } = useUser();

    const exploreMoreOpacity = scrollY ? scrollY.interpolate({
        inputRange: [0, height * 0.3],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    }) : 1;

    const getProfilePhoto = async () => {
        try {
            // First try to load user's saved photo from database
            const userEmail = "test2@example.com"; // Replace with actual user email
            const result = await getUserWithPersonality(userEmail);
            
            if (result.success && result.user && result.user.profilePhotoURL) {
                return result.user.profilePhotoURL;
            } else {
                // Fallback to random photo
                let response = await fetch("https://picsum.photos/200/20");
                return response.url;
            }
        } catch (error) {
            console.error("Error loading profile photo:", error);
            let response = await fetch("https://picsum.photos/200/20");
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

    useFocusEffect(
        React.useCallback(() => {
            const loadUserData = async () => {
                try {
                    const userEmail = currentUser?.email || "test2@example.com"; // Use current user or fallback
                    const result = await getUserWithPersonality(userEmail);
                    
                    if (result.success && result.user) {
                        // Load user name and age
                        if (result.user.firstName && result.user.lastName) {
                            setUserName(`${result.user.firstName} ${result.user.lastName}`);
                        }
                        
                        if (result.user.birthDate) {
                            const age = calculateAge(result.user.birthDate);
                            setUserAge(age.toString());
                        }

                        // Load background color from database first
                        if (result.user.profileBackgroundColor) {
                            setBgColor(result.user.profileBackgroundColor);
                            // Save to AsyncStorage for faster future loading
                            await AsyncStorage.setItem('profileBackgroundColor', result.user.profileBackgroundColor);
                        } else {
                            // Fallback to AsyncStorage if not in database
                            const savedColor = await AsyncStorage.getItem('profileBackgroundColor');
                            if (savedColor) {
                                setBgColor(savedColor);
                            }
                        }

                        // Load user banners from database
                        if (result.user.selectedProfileBanners) {
                            setSelectedBanners(result.user.selectedProfileBanners);
                        } else {
                            // Set default banners if none saved
                            setSelectedBanners([
                                {
                                    id: 'personality_type',
                                    label: 'Personality',
                                    value: 'Extrovert',
                                    gradient: ['#667eea', '#764ba2'],
                                    textColor: 'white'
                                },
                                {
                                    id: 'candy_choice',
                                    label: 'Candy Choice',
                                    value: 'Skittles 🌈',
                                    gradient: ['#ffecd2', '#fcb69f'],
                                    textColor: '#333'
                                },
                                {
                                    id: 'time_preference',
                                    label: 'Morning Person',
                                    value: 'Night Owl 🦉',
                                    gradient: ['#a8edea', '#fed6e3'],
                                    textColor: '#333'
                                },
                                {
                                    id: 'social_style',
                                    label: 'Social Style',
                                    value: 'Party Starter',
                                    gradient: ['#d299c2', '#fef9d7'],
                                    textColor: '#333'
                                },
                                {
                                    id: 'home_style',
                                    label: 'Dream Home',
                                    value: 'Cozy Cottage 🏠',
                                    gradient: ['#ff9a9e', '#fecfef'],
                                    textColor: '#333'
                                }
                            ]);
                        }
                    } else {
                        // If no user data, fall back to AsyncStorage for color
                        const savedColor = await AsyncStorage.getItem('profileBackgroundColor');
                        if (savedColor) {
                            setBgColor(savedColor);
                        }
                    }
                } catch (e) {
                    console.error('Failed to load user data', e);
                    // Fallback to AsyncStorage
                    try {
                        const savedColor = await AsyncStorage.getItem('profileBackgroundColor');
                        if (savedColor) {
                            setBgColor(savedColor);
                        }
                    } catch (asyncError) {
                        console.error('Failed to load from AsyncStorage', asyncError);
                    }
                }
            };
            loadUserData();
        }, [])
    );

    const handleEditPress = () => {
        navigation.navigate('EditProfile');
    };

    return (
        <View style={styles.fullContainer}>
            <StatusBar backgroundColor={bgColor} barStyle="dark-content" translucent={false} />
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient
                    colors={[bgColor, '#ffffff']}
                    style={styles.container}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                >
                    <TouchableOpacity style={styles.editProfileContainer} onPress={handleEditPress}>
                        <Text style={styles.editProfileText}>Edit</Text>
                    </TouchableOpacity>

                    <View style={styles.photoContainer}>
                        <View style={styles.photoFrame}>
                            {photoUrl ? (
                                <Image
                                    source={{ uri: photoUrl }}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            ) : (
                                <View style={styles.loadingText}>
                                    <Text>Loading...</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.profileInfoContainer}>
                        <View style={styles.profileInfoNameContainer}>
                            <Text style={styles.nameText}>{userName}</Text>
                            <Text style={styles.ageText}>{userAge}</Text>
                        </View>

                        {/* Stats Container - Now shows banners from database */}
                        <View style={styles.statsContainer}>
                            {selectedBanners.slice(0, 5).map((banner, index) => (
                                <LinearGradient
                                    key={banner.id || index}
                                    colors={banner.gradient}
                                    style={styles.statRow}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={[
                                        banner.textColor === 'white' ? styles.statLabel : styles.statLabelDark
                                    ]}>
                                        {banner.label}
                                    </Text>
                                    <Text style={[
                                        banner.textColor === 'white' ? styles.statValue : styles.statValueDark
                                    ]}>
                                        {banner.value}
                                    </Text>
                                </LinearGradient>
                            ))}
                        </View>

                        {/* Explore More Indicator */}
                        {scrollY ? (
                            <Animated.View style={[styles.exploreMoreContainer, { opacity: exploreMoreOpacity }]}>
                                <Text style={styles.exploreMoreArrow}>↑</Text>
                                <Text style={styles.exploreMoreText}>Explore More</Text>
                            </Animated.View>
                        ) : (
                            <View style={styles.exploreMoreContainer}>
                                <Text style={styles.exploreMoreArrow}>↑</Text>
                                <Text style={styles.exploreMoreText}>Explore More</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
        backgroundColor: '#e3f2fd',
    },
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    headerContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'black',
        fontFamily: 'Georgia-Italic',
    },
    editProfileContainer: {
        alignItems: 'center',
        height: 23,
        position: 'absolute',
        right: 20,
        top: 8,
        backgroundColor: 'rgba(128, 128, 128, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 0.4)',
        borderRadius: 18,
        paddingVertical: 0,
        paddingHorizontal: 16,
        zIndex: 10,
    },
    editProfileText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        textAlign: 'center',
        opacity: 0.6,
    },
    photoContainer: {
        height: 200,
        width: '100%',
        alignItems: 'center',
        paddingTop: 20
    },
    photoFrame: {
        width: 170,
        height: 170,
        borderRadius: 100,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#ddd',
    },
    loadingText: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    profileInfoContainer: {
        flex: 1,
        marginTop: 23,
    },
    profileInfoNameContainer: {
        height: 100,
        justifyContent: 'flex-start',
        alignItems: 'center',
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
        marginBottom: 20,
    },
    statsContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '500',
        color: 'white',
    },
    statLabelDark: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    statValueDark: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    exploreMoreContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    exploreMoreArrow: {
        fontSize: 20,
        color: '#666',
        marginBottom: 2,
        fontWeight: 'bold',
    },
    exploreMoreText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
});