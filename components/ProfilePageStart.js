import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, StatusBar, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

export default function ProfilePageStart({ scrollY }) {
    const [bgColor, setBgColor] = useState('#e3f2fd');
    const [photoUrl, setPhotoUrl] = useState('');
    const navigation = useNavigation();

    const exploreMoreOpacity = scrollY ? scrollY.interpolate({
        inputRange: [0, height * 0.3],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    }) : 1;

    const getProfilePhoto = async () => {
        let response = await fetch("https://picsum.photos/200/20");
        return response.url;
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
            const loadColor = async () => {
                try {
                    const savedColor = await AsyncStorage.getItem('profileBackgroundColor');
                    if (savedColor) {
                        setBgColor(savedColor);
                    }
                } catch (e) {
                    console.error('Failed to load background color', e);
                }
            };
            loadColor();
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
                            <Text style={styles.nameText}>Sarah Johnson</Text>
                            <Text style={styles.ageText}>24</Text>
                        </View>

                        {/* Stats Container */}
                        <View style={styles.statsContainer}>
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.statRow}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.statLabel}>Personality</Text>
                                <Text style={styles.statValue}>Extrovert</Text>
                            </LinearGradient>

                            <LinearGradient
                                colors={['#ffecd2', '#fcb69f']}
                                style={styles.statRow}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.statLabelDark}>Candy Choice</Text>
                                <Text style={styles.statValueDark}>Skittles 🌈</Text>
                            </LinearGradient>

                            <LinearGradient
                                colors={['#a8edea', '#fed6e3']}
                                style={styles.statRow}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.statLabelDark}>Morning Person</Text>
                                <Text style={styles.statValueDark}>Night Owl 🦉</Text>
                            </LinearGradient>

                            <LinearGradient
                                colors={['#d299c2', '#fef9d7']}
                                style={styles.statRow}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.statLabelDark}>Social Style</Text>
                                <Text style={styles.statValueDark}>Party Starter</Text>
                            </LinearGradient>
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
