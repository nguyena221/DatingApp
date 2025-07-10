import React, { useState, useEffect, useCallback } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity, 
    ScrollView, 
    Modal, 
    Dimensions,
    SafeAreaView,
    StatusBar,
    Linking,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { 
    getUserWidgetData, 
    removeWidgetItem, 
    updateWidgetItem 
} from '../backend/UserService';

const { width, height } = Dimensions.get('window');

const FoodieSpotsWidget = ({ navigation, userData, viewOnly = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [foodieSpots, setFoodieSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    // Load spots from database when component mounts or regains focus
    useFocusEffect(
        useCallback(() => {
            loadSpotsFromDatabase();
        }, [userData, viewOnly])
    );

    const loadSpotsFromDatabase = async () => {
        try {
            setLoading(true);
            
            if (viewOnly && userData) {
                // For viewing other users, use the data passed in userData
                const spotsData = userData.widgetData?.foodie?.spots || [];
                setFoodieSpots(spotsData);
            } else {
                // For own profile, fetch from database as usual
                const userEmail = user?.email || "test2@example.com";
                const result = await getUserWidgetData(userEmail, 'foodie');
                
                if (result.success && result.data) {
                    setFoodieSpots(result.data.spots || []);
                } else {
                    console.log("No foodie spots data found, starting with empty array");
                    setFoodieSpots([]);
                }
            }
        } catch (error) {
            console.error("Error loading foodie spots:", error);
            setFoodieSpots([]);
        } finally {
            setLoading(false);
        }
    };

    const averageRating = foodieSpots.length > 0 ? (foodieSpots.reduce((sum, spot) => sum + spot.rating, 0) / foodieSpots.length).toFixed(1) : 0;
    const uniqueCuisines = [...new Set(foodieSpots.map(s => s.cuisine))];
    
    const openExpanded = () => {
        setIsExpanded(true);
    };

    const closeExpanded = () => {
        setIsExpanded(false);
    };

    // Navigate to AddFoodieSpot screen (only for own profile)
    const handleAddSpot = () => {
        if (viewOnly) return; // Don't allow adding for other users
        
        console.log('🍽️ Navigating to AddFoodieSpot screen');
        console.log('🍽️ Navigation object:', navigation);
        
        // Close the expanded modal first
        setIsExpanded(false);
        
        // Then navigate after a small delay to ensure modal is closed
        setTimeout(() => {
            if (navigation && navigation.navigate) {
                navigation.navigate('AddFoodieSpot');
            } else {
                console.error('❌ Navigation not available');
                Alert.alert('Error', 'Navigation not available. Please try again.');
            }
        }, 300);
    };

    const handleRemoveSpot = async (spotId) => {
        if (viewOnly) return; // Don't allow removing for other users
        
        console.log('🗑️ handleRemoveSpot called with spotId:', spotId);
        
        Alert.alert(
            'Remove Spot',
            'Are you sure you want to remove this spot from your collection?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🗑️ User confirmed deletion');
                            const userEmail = user?.email || "test2@example.com";
                            console.log('🗑️ Removing spot from database for user:', userEmail);
                            
                            const result = await removeWidgetItem(userEmail, 'foodie', spotId);
                            console.log('🗑️ Database result:', result);
                            
                            if (result.success) {
                                console.log('✅ Spot removed from database, updating local state');
                                setFoodieSpots(prevSpots => {
                                    const updatedSpots = prevSpots.filter(spot => spot.id !== spotId);
                                    console.log('✅ Updated spots array:', updatedSpots);
                                    return updatedSpots;
                                });
                                Alert.alert('Success', 'Spot removed successfully!');
                            } else {
                                console.log('❌ Database removal failed:', result.message);
                                Alert.alert('Error', result.message || 'Failed to remove spot');
                            }
                        } catch (error) {
                            console.error("❌ Error removing spot:", error);
                            Alert.alert('Error', 'Failed to remove spot');
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateSpotRating = async (spotId, newRating) => {
        if (viewOnly) return; // Don't allow editing for other users
        
        try {
            const userEmail = user?.email || "test2@example.com";
            const result = await updateWidgetItem(userEmail, 'foodie', spotId, { rating: newRating });
            
            if (result.success) {
                setFoodieSpots(prevSpots => 
                    prevSpots.map(spot => 
                        spot.id === spotId ? { ...spot, rating: newRating } : spot
                    )
                );
            } else {
                Alert.alert('Error', result.message || 'Failed to update rating');
            }
        } catch (error) {
            console.error("Error updating rating:", error);
            Alert.alert('Error', 'Failed to update rating');
        }
    };

    const renderStars = (rating, size = 12, interactive = false, spotId = null) => {
        // Disable interactivity if in viewOnly mode
        const isInteractive = interactive && !viewOnly;
        
        return Array.from({ length: 5 }, (_, i) => (
            <TouchableOpacity
                key={i}
                disabled={!isInteractive}
                onPress={isInteractive ? () => handleUpdateSpotRating(spotId, i + 1) : undefined}
                activeOpacity={isInteractive ? 0.7 : 1}
            >
                <Text style={[styles.star, { fontSize: size }]}>
                    {i < rating ? '★' : '☆'}
                </Text>
            </TouchableOpacity>
        ));
    };

    const getPriceColor = (priceRange) => {
        switch (priceRange) {
            case '$': return '#4CAF50';
            case '$$': return '#FF9800';
            case '$$$': return '#FF5722';
            case '$$$$': return '#9C27B0';
            default: return '#666';
        }
    };

    // Get the title based on viewOnly mode
    const getTitle = () => {
        if (viewOnly && userData) {
            const name = userData.firstName || 'User';
            return `🍽️ Foodie Spots`;
        }
        return '🍽️ Foodie Spots';
    };

    const getExpandedTitle = () => {
        if (viewOnly && userData) {
            const name = userData.firstName || 'User';
            return `🍽️ ${name}'s Foodie Journey`;
        }
        return '🍽️ My Foodie Journey';
    };

    // Compact Widget View
    const CompactWidget = () => (
        <TouchableOpacity onPress={openExpanded} style={styles.widgetContainer} activeOpacity={0.8}>
            <LinearGradient
                colors={['#e74c3c', '#f39c12']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>{getTitle()}</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.stat}>{foodieSpots.length} spots</Text>
                        <Text style={styles.stat}>★ {averageRating} avg</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading spots...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.spotsList} showsVerticalScrollIndicator={false}>
                        {foodieSpots.slice(0, 3).map((spot) => (
                            <View key={spot.id} style={styles.spotItem}>
                                <View style={styles.spotLeft}>
                                    <Text style={styles.spotEmoji}>{spot.emoji}</Text>
                                    <View style={styles.spotInfo}>
                                        <Text style={styles.spotName} numberOfLines={1}>{spot.title}</Text>
                                        <Text style={styles.spotCuisine}>{spot.cuisine} • {spot.priceRange}</Text>
                                    </View>
                                </View>
                                <View style={styles.compactRightSection}>
                                    <View style={styles.ratingContainer}>
                                        {renderStars(spot.rating, 10)}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.expandHint}>
                    <Text style={styles.expandHintText}>Tap to see all {foodieSpots.length} spots</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    // Expanded Modal View
    const ExpandedWidget = () => (
        <Modal
            visible={isExpanded}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={closeExpanded}
        >
            <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
            <LinearGradient
                colors={['#e74c3c', '#f39c12']}
                style={styles.expandedContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <SafeAreaView style={styles.expandedSafeArea}>
                    {/* Header */}
                    <View style={styles.expandedHeader}>
                        <TouchableOpacity onPress={closeExpanded} style={styles.closeButton} activeOpacity={0.7}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.expandedTitle}>{getExpandedTitle()}</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Stats */}
                    <View style={styles.expandedStatsContainer}>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{foodieSpots.length}</Text>
                            <Text style={styles.expandedStatLabel}>Total Spots</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>★ {averageRating}</Text>
                            <Text style={styles.expandedStatLabel}>Avg Rating</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{uniqueCuisines.length}</Text>
                            <Text style={styles.expandedStatLabel}>Cuisines</Text>
                        </View>
                    </View>

                    {/* Cuisine Tags */}
                    {uniqueCuisines.length > 0 && (
                        <View style={styles.cuisineContainer}>
                            <Text style={styles.cuisineTitle}>Cuisines Explored:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.cuisineTags}>
                                    {uniqueCuisines.map((cuisine, index) => (
                                        <View key={index} style={styles.cuisineTag}>
                                            <Text style={styles.cuisineText}>{cuisine}</Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}

                    {/* Spots List */}
                    <ScrollView 
                        style={styles.expandedSpotsList} 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {foodieSpots.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>
                                    {viewOnly ? 'No spots in collection yet!' : 'No spots in your collection yet!'}
                                </Text>
                                <Text style={styles.emptyStateSubtext}>
                                    {viewOnly 
                                        ? 'This user hasn\'t added any foodie spots yet' 
                                        : 'Add your first foodie spot to get started'
                                    }
                                </Text>
                            </View>
                        ) : (
                            foodieSpots.map((spot) => (
                                <View key={spot.id} style={styles.swipeableContainer}>
                                    <TouchableOpacity 
                                        style={styles.expandedSpotItem}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.expandedSpotHeader}>
                                            <View style={styles.spotLeft}>
                                                <Text style={styles.expandedSpotEmoji}>{spot.emoji}</Text>
                                                <View style={styles.spotInfo}>
                                                    <Text style={styles.expandedSpotName}>{spot.title}</Text>
                                                    <Text style={styles.expandedSpotLocation}>{spot.location}</Text>
                                                    <View style={styles.expandedSpotMeta}>
                                                        <Text style={styles.expandedSpotCuisine}>{spot.cuisine}</Text>
                                                        <View style={[styles.priceTag, { backgroundColor: getPriceColor(spot.priceRange) }]}>
                                                            <Text style={styles.priceText}>{spot.priceRange}</Text>
                                                        </View>
                                                        <View style={styles.expandedRatingContainer}>
                                                            {renderStars(spot.rating, 14, true, spot.id)}
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                            
                                            {/* Only show delete button if not in viewOnly mode */}
                                            {!viewOnly && (
                                                <View style={styles.spotActions}>
                                                    <TouchableOpacity
                                                        style={styles.deleteIconButton}
                                                        onPress={() => {
                                                            console.log('🗑️ Delete button pressed for spot:', spot.id, spot.title);
                                                            handleRemoveSpot(spot.id);
                                                        }}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={styles.deleteIconText}>🗑️</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                        
                                        {spot.signature && (
                                            <View style={styles.signatureContainer}>
                                                <Text style={styles.signatureLabel}>Must-try: </Text>
                                                <Text style={styles.signatureText}>{spot.signature}</Text>
                                            </View>
                                        )}
                                        
                                        {spot.review && (
                                            <Text style={styles.spotReview}>"{spot.review}"</Text>
                                        )}
                                        
                                        {spot.visited && (
                                            <View style={styles.visitedContainer}>
                                                <Text style={styles.visitedText}>Visited: {new Date(spot.visited).toLocaleDateString()}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {/* Add Button - Only show if not in viewOnly mode */}
                    {!viewOnly && (
                        <TouchableOpacity 
                            style={styles.expandedAddButton}
                            onPress={handleAddSpot}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.expandedAddButtonText}>+ Add New Spot</Text>
                        </TouchableOpacity>
                    )}
                </SafeAreaView>
            </LinearGradient>
        </Modal>
    );

    return (
        <>
            <CompactWidget />
            <ExpandedWidget />
        </>
    );
};

const styles = StyleSheet.create({
    // Compact Widget Styles
    widgetContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    container: {
        height: 360,
        width: 180,
        borderRadius: 12,
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stat: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    spotsList: {
        flex: 1,
    },
    spotItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        padding: 8,
        marginBottom: 6,
    },
    spotLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    spotEmoji: {
        fontSize: 16,
        marginRight: 8,
    },
    spotInfo: {
        flex: 1,
    },
    spotName: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    spotCuisine: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    compactRightSection: {
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    star: {
        color: '#FFD700',
        marginHorizontal: 0.5,
    },
    expandHint: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 6,
        padding: 6,
        marginTop: 8,
    },
    expandHintText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 10,
        textAlign: 'center',
        fontStyle: 'italic',
    },

    // Loading state
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },

    // Expanded Modal Styles
    expandedContainer: {
        flex: 1,
    },
    expandedSafeArea: {
        flex: 1,
        paddingHorizontal: 20,
    },
    expandedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    expandedTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    placeholder: {
        width: 32,
    },
    expandedStatsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    expandedStatBox: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
        minWidth: 80,
    },
    expandedStatNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    expandedStatLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    cuisineContainer: {
        marginBottom: 20,
    },
    cuisineTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
    },
    cuisineTags: {
        flexDirection: 'row',
        gap: 8,
    },
    cuisineTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    cuisineText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    expandedSpotsList: {
        flex: 1,
    },
    swipeableContainer: {
        marginBottom: 12,
    },
    expandedSpotItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
    },
    expandedSpotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    spotActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    expandedSpotEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    expandedSpotName: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    expandedSpotLocation: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 8,
    },
    expandedSpotMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    expandedSpotCuisine: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    priceTag: {
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    priceText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    expandedRatingContainer: {
        flexDirection: 'row',
    },
    deleteIconButton: {
        backgroundColor: 'rgba(255, 71, 87, 0.2)',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 71, 87, 0.4)',
    },
    deleteIconText: {
        fontSize: 16,
    },
    signatureContainer: {
        flexDirection: 'row',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    signatureLabel: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
    },
    signatureText: {
        fontSize: 13,
        color: 'white',
        fontStyle: 'italic',
    },
    spotReview: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontStyle: 'italic',
        lineHeight: 20,
        marginBottom: 8,
    },
    visitedContainer: {
        alignItems: 'flex-end',
    },
    visitedText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.6)',
        fontStyle: 'italic',
    },
    expandedAddButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 16,
        marginVertical: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    expandedAddButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    
    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
    },
});

export default FoodieSpotsWidget;