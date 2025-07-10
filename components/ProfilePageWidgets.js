import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserWithPersonality } from '../backend/UserService';
import { useUser } from '../contexts/UserContext';
import TravelPinsWidget from '../widgets/TravelPinsWidget';
import FavoriteMoviesWidget from '../widgets/FavoriteMoviesWidget';
import FavoriteBooksWidget from '../widgets/FavoriteBooksWidget';
import FoodieSpotsWidget from '../widgets/FoodieSpotsWidget';
import { useNavigation } from '@react-navigation/native';
import TVShowsWidget from '../widgets/TVShowsWidget';
import FitnessGoalsWidget from '../widgets/FitnessGoalsWidget';
import HobbiesSkillsWidget from '../widgets/HobbiesSkillsWidget';

export default function ProfilePageWidgets() {
    const [bgColor, setBgColor] = useState('#e3f2fd');
    const [selectedWidgets, setSelectedWidgets] = useState(['travel', 'movies', 'books', 'foodie', 'tvshows', 'fitnessgoals', 'hobbies']);
    const { currentUser } = useUser();
    const navigation = useNavigation();

    // Widget component mapping
    const widgetComponents = {
        travel: TravelPinsWidget,
        movies: FavoriteMoviesWidget,
        books: FavoriteBooksWidget,
        foodie: FoodieSpotsWidget,
        tvshows: TVShowsWidget,
        fitness: FitnessGoalsWidget,
        hobbies: HobbiesSkillsWidget,
        // Future widgets will be added here
        music: () => <ComingSoonWidget type="Music Vibes" emoji="🎵" />,
        goals: () => <ComingSoonWidget type="Life Goals" emoji="🎯" />,
    };

    // Coming Soon Widget Component
    const ComingSoonWidget = ({ type, emoji }) => (
        <View style={styles.comingSoonWidget}>
            <Text style={styles.comingSoonEmoji}>{emoji}</Text>
            <Text style={styles.comingSoonText}>{type}</Text>
            <Text style={styles.comingSoonSubtext}>Coming Soon!</Text>
        </View>
    );

    useFocusEffect(
        React.useCallback(() => {
            const loadUserData = async () => {
                try {
                    const userEmail = currentUser?.email || "test2@example.com";
                    const result = await getUserWithPersonality(userEmail);
                    
                    if (result.success && result.user) {
                        // Load background color from database first
                        if (result.user.profileBackgroundColor) {
                            setBgColor(result.user.profileBackgroundColor);
                            await AsyncStorage.setItem('profileBackgroundColor', result.user.profileBackgroundColor);
                        } else {
                            const savedColor = await AsyncStorage.getItem('profileBackgroundColor');
                            if (savedColor) {
                                setBgColor(savedColor);
                            }
                        }

                        // Load selected widgets from database
                        if (result.user.selectedWidgets && result.user.selectedWidgets.length > 0) {
                            setSelectedWidgets(result.user.selectedWidgets);
                        } else {
                            // Default widgets if none saved
                            setSelectedWidgets(['travel', 'movies', 'books', 'foodie', 'tvshows', 'fitnessgoals']);
                        }
                    } else {
                        const savedColor = await AsyncStorage.getItem('profileBackgroundColor');
                        if (savedColor) {
                            setBgColor(savedColor);
                        }
                    }
                } catch (e) {
                    console.error('Failed to load user data', e);
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
        }, [currentUser])
    );

    // Render widget component based on ID
    const renderWidget = (widgetId, index) => {
        const WidgetComponent = widgetComponents[widgetId];
        
        if (!WidgetComponent) {
            return (
                <View key={`empty-${index}`} style={styles.infoPanel}>
                    <ComingSoonWidget type="Unknown Widget" emoji="❓" />
                </View>
            );
        }

        return (
            <View key={`widget-${widgetId}-${index}`} style={styles.infoPanel}>
                <WidgetComponent navigation={navigation}/>
            </View>
        );
    };

    // Arrange widgets in 2x2 grid
    const renderWidgetGrid = () => {
        const widgets = selectedWidgets.slice(0, 4); // Ensure only 4 widgets
        
        // Fill empty spots if less than 4 widgets
        while (widgets.length < 4) {
            widgets.push(null);
        }

        return (
            <>
                <View style={styles.topRow}>
                    {widgets[0] ? renderWidget(widgets[0], 0) : <EmptySlot index={0} />}
                    {widgets[1] ? renderWidget(widgets[1], 1) : <EmptySlot index={1} />}
                </View>
                <View style={styles.bottomRow}>
                    {widgets[2] ? renderWidget(widgets[2], 2) : <EmptySlot index={2} />}
                    {widgets[3] ? renderWidget(widgets[3], 3) : <EmptySlot index={3} />}
                </View>
            </>
        );
    };

    // Empty slot component for unselected widget positions
    const EmptySlot = ({ index }) => (
        <View style={[styles.infoPanel, styles.emptySlot]}>
            <Text style={styles.emptySlotEmoji}>➕</Text>
            <Text style={styles.emptySlotText}>Empty Slot</Text>
            <Text style={styles.emptySlotSubtext}>
                Go to Edit Profile to add a widget here
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.infoPanelsContainer}>
                    {renderWidgetGrid()}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    infoPanelsContainer:{
        flex:1,
        paddingTop:0,
        justifyContent:'space-evenly',
        top: 30
    },
    infoPanel: {
        height: 360,
        width: 180,
        borderRadius: 8
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    emptySlot: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptySlotEmoji: {
        fontSize: 32,
        marginBottom: 12,
        opacity: 0.7,
    },
    emptySlotText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.6)',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySlotSubtext: {
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        lineHeight: 16,
    },
    comingSoonWidget: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    comingSoonEmoji: {
        fontSize: 32,
        marginBottom: 12,
    },
    comingSoonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.7)',
        textAlign: 'center',
        marginBottom: 4,
    },
    comingSoonSubtext: {
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});