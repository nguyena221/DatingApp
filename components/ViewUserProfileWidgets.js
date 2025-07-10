import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import TravelPinsWidget from '../widgets/TravelPinsWidget';
import FavoriteMoviesWidget from '../widgets/FavoriteMoviesWidget';
import FavoriteBooksWidget from '../widgets/FavoriteBooksWidget';
import FoodieSpotsWidget from '../widgets/FoodieSpotsWidget';
import TVShowsWidget from '../widgets/TVShowsWidget';
import FitnessGoalsWidget from '../widgets/FitnessGoalsWidget';
import HobbiesSkillsWidget from '../widgets/HobbiesSkillsWidget';
import LifeGoalsWidget from '../widgets/LifeGoalsWidget';

export default function ViewUserProfileWidgets({ userData, navigation }) {
    const [bgColor, setBgColor] = useState('#e3f2fd');
    const [selectedWidgets, setSelectedWidgets] = useState(['travel', 'tvshows', 'books', 'fitness']);

    // Widget component mapping
    const widgetComponents = {
        travel: TravelPinsWidget,
        movies: FavoriteMoviesWidget,
        books: FavoriteBooksWidget,
        foodie: FoodieSpotsWidget,
        tvshows: TVShowsWidget,
        fitness: FitnessGoalsWidget,
        hobbies: HobbiesSkillsWidget,
        goals: LifeGoalsWidget,
        // Future widgets will be added here
        music: () => <ComingSoonWidget type="Music Vibes" emoji="🎵" />,
    };

    // Coming Soon Widget Component
    const ComingSoonWidget = ({ type, emoji }) => (
        <View style={styles.comingSoonWidget}>
            <Text style={styles.comingSoonEmoji}>{emoji}</Text>
            <Text style={styles.comingSoonText}>{type}</Text>
            <Text style={styles.comingSoonSubtext}>Coming Soon!</Text>
        </View>
    );

    useEffect(() => {
        if (userData) {
            // Set background color
            setBgColor(userData.profileBackgroundColor || '#e3f2fd');

            // Set selected widgets
            if (userData.selectedWidgets && userData.selectedWidgets.length > 0) {
                setSelectedWidgets(userData.selectedWidgets);
            } else {
                // Default widgets if none saved
                setSelectedWidgets(['travel', 'movies', 'books', 'foodie']);
            }
        }
    }, [userData]);

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
                <WidgetComponent 
                    navigation={navigation}
                    userData={userData}
                    viewOnly={true}
                />
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
            <Text style={styles.emptySlotEmoji}>📱</Text>
            <Text style={styles.emptySlotText}>Empty Slot</Text>
            <Text style={styles.emptySlotSubtext}>
                This user hasn't added a widget here yet
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