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

const TravelPinsWidget = ({ navigation, userData, viewOnly = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    // Load destinations from database when component mounts or regains focus
    useFocusEffect(
        useCallback(() => {
            loadDestinationsFromDatabase();
        }, [userData, viewOnly])
    );

    const loadDestinationsFromDatabase = async () => {
        try {
            setLoading(true);
            
            if (viewOnly && userData) {
                // For viewing other users, use the data passed in userData
                const travelData = userData.widgetData?.travel?.destinations || [];
                setDestinations(travelData);
            } else {
                // For own profile, fetch from database as usual
                const userEmail = user?.email || "test2@example.com";
                const result = await getUserWidgetData(userEmail, 'travel');
                
                if (result.success && result.data) {
                    setDestinations(result.data.destinations || []);
                } else {
                    console.log("No travel data found, starting with empty array");
                    setDestinations([]);
                }
            }
        } catch (error) {
            console.error("Error loading destinations:", error);
            setDestinations([]);
        } finally {
            setLoading(false);
        }
    };

    const wishlistCount = destinations.filter(d => !d.visited).length;
    const visitedCount = destinations.filter(d => d.visited).length;

    const openExpanded = () => {
        setIsExpanded(true);
    };

    const closeExpanded = () => {
        setIsExpanded(false);
    };

    // Navigate to AddDestination screen (only for own profile)
    const handleAddDestination = () => {
        if (viewOnly) return; // Don't allow adding for other users
        
        console.log('✈️ Navigating to AddDestination screen');
        console.log('✈️ Navigation object:', navigation);
        
        // Close the expanded modal first
        setIsExpanded(false);
        
        // Then navigate after a small delay to ensure modal is closed
        setTimeout(() => {
            if (navigation && navigation.navigate) {
                navigation.navigate('AddDestination');
            } else {
                console.error('❌ Navigation not available');
                Alert.alert('Error', 'Navigation not available. Please try again.');
            }
        }, 300);
    };

    const handleRemoveDestination = async (destinationId) => {
        if (viewOnly) return; // Don't allow removing for other users
        
        console.log('🗑️ handleRemoveDestination called with destinationId:', destinationId);
        
        Alert.alert(
            'Remove Destination',
            'Are you sure you want to remove this destination from your travel list?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🗑️ User confirmed deletion');
                            const userEmail = user?.email || "test2@example.com";
                            console.log('🗑️ Removing destination from database for user:', userEmail);
                            
                            const result = await removeWidgetItem(userEmail, 'travel', destinationId);
                            console.log('🗑️ Database result:', result);
                            
                            if (result.success) {
                                console.log('✅ Destination removed from database, updating local state');
                                setDestinations(prevDestinations => {
                                    const updatedDestinations = prevDestinations.filter(destination => destination.id !== destinationId);
                                    console.log('✅ Updated destinations array:', updatedDestinations);
                                    return updatedDestinations;
                                });
                                Alert.alert('Success', 'Destination removed successfully!');
                            } else {
                                console.log('❌ Database removal failed:', result.message);
                                Alert.alert('Error', result.message || 'Failed to remove destination');
                            }
                        } catch (error) {
                            console.error("❌ Error removing destination:", error);
                            Alert.alert('Error', 'Failed to remove destination');
                        }
                    }
                }
            ]
        );
    };

    const handleToggleVisited = async (destinationId, currentVisited) => {
        if (viewOnly) return; // Don't allow editing for other users
        
        try {
            const userEmail = user?.email || "test2@example.com";
            const result = await updateWidgetItem(userEmail, 'travel', destinationId, { visited: !currentVisited });
            
            if (result.success) {
                setDestinations(prevDestinations => 
                    prevDestinations.map(destination => 
                        destination.id === destinationId ? { ...destination, visited: !currentVisited } : destination
                    )
                );
            } else {
                Alert.alert('Error', result.message || 'Failed to update destination');
            }
        } catch (error) {
            console.error("Error updating destination:", error);
            Alert.alert('Error', 'Failed to update destination');
        }
    };

    // Get the title based on viewOnly mode
    const getTitle = () => {
        if (viewOnly && userData) {
            const name = userData.firstName || 'User';
            return `✈️ Travel Dreams`;
        }
        return '✈️ Travel Dreams';
    };

    const getExpandedTitle = () => {
        if (viewOnly && userData) {
            const name = userData.firstName || 'User';
            return `✈️ Travel Dreams`;
        }
        return '✈️ My Travel Dreams';
    };

    // Compact Widget View
    const CompactWidget = () => (
        <TouchableOpacity onPress={openExpanded} style={styles.widgetContainer} activeOpacity={0.8}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>{getTitle()}</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.stat}>{visitedCount} visited</Text>
                        <Text style={styles.stat}>{wishlistCount} wishlist</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading destinations...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.destinationsList} showsVerticalScrollIndicator={false}>
                        {destinations.slice(0, 4).map((destination) => (
                            <View key={destination.id} style={styles.destinationItem}>
                                <View style={styles.destinationLeft}>
                                    <Text style={styles.emoji}>{destination.emoji}</Text>
                                    <View style={styles.destinationInfo}>
                                        <Text style={styles.destinationName}>{destination.name}</Text>
                                        <Text style={styles.destinationCountry}>{destination.country}</Text>
                                    </View>
                                </View>
                                <View style={[
                                    styles.statusBadge, 
                                    destination.visited ? styles.visitedBadge : styles.wishlistBadge
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        destination.visited ? styles.visitedText : styles.wishlistText
                                    ]}>
                                        {destination.visited ? '✓' : '♡'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.expandHint}>
                    <Text style={styles.expandHintText}>Tap to see all {destinations.length} destinations</Text>
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
            <StatusBar barStyle="light-content" backgroundColor="#667eea" />
            <LinearGradient
                colors={['#667eea', '#764ba2']}
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
                            <Text style={styles.expandedStatNumber}>{visitedCount}</Text>
                            <Text style={styles.expandedStatLabel}>Visited</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{wishlistCount}</Text>
                            <Text style={styles.expandedStatLabel}>Wishlist</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{destinations.length}</Text>
                            <Text style={styles.expandedStatLabel}>Total</Text>
                        </View>
                    </View>

                    {/* Destinations List */}
                    <ScrollView 
                        style={styles.expandedDestinationsList} 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {destinations.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>
                                    {viewOnly ? 'No destinations added yet!' : 'No destinations added yet!'}
                                </Text>
                                <Text style={styles.emptyStateSubtext}>
                                    {viewOnly 
                                        ? 'This user hasn\'t added any travel destinations yet' 
                                        : 'Add your first travel destination to get started'
                                    }
                                </Text>
                            </View>
                        ) : (
                            destinations.map((destination) => (
                                <View key={destination.id} style={styles.swipeableContainer}>
                                    <TouchableOpacity 
                                        style={styles.expandedDestinationItem}
                                        activeOpacity={0.7}
                                        disabled={viewOnly}
                                    >
                                        <View style={styles.expandedDestinationHeader}>
                                            <View style={styles.destinationLeft}>
                                                <Text style={styles.expandedEmoji}>{destination.emoji}</Text>
                                                <View style={styles.destinationInfo}>
                                                    <Text style={styles.expandedDestinationName}>{destination.name}</Text>
                                                    <Text style={styles.expandedDestinationCountry}>{destination.country}</Text>
                                                </View>
                                            </View>
                                            
                                            {/* Only show action buttons if not in viewOnly mode */}
                                            {!viewOnly && (
                                                <View style={styles.destinationActions}>
                                                    {/* Toggle Visited Status */}
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.toggleButton,
                                                            destination.visited ? styles.visitedBadge : styles.wishlistBadge
                                                        ]}
                                                        onPress={() => {
                                                            console.log('🔄 Toggle visited status for destination:', destination.id, destination.name);
                                                            handleToggleVisited(destination.id, destination.visited);
                                                        }}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={[
                                                            styles.toggleButtonText,
                                                            destination.visited ? styles.visitedText : styles.wishlistText
                                                        ]}>
                                                            {destination.visited ? '✓' : '♡'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    
                                                    {/* Delete Button */}
                                                    <TouchableOpacity
                                                        style={styles.deleteIconButton}
                                                        onPress={() => {
                                                            console.log('🗑️ Delete button pressed for destination:', destination.id, destination.name);
                                                            handleRemoveDestination(destination.id);
                                                        }}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={styles.deleteIconText}>🗑️</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            
                                            {/* Show read-only status if in viewOnly mode */}
                                            {viewOnly && (
                                                <View style={[
                                                    styles.statusBadge, 
                                                    destination.visited ? styles.visitedBadge : styles.wishlistBadge
                                                ]}>
                                                    <Text style={[
                                                        styles.statusText,
                                                        destination.visited ? styles.visitedText : styles.wishlistText
                                                    ]}>
                                                        {destination.visited ? '✓' : '♡'}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        {destination.notes && (
                                            <Text style={styles.destinationNotes}>{destination.notes}</Text>
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
                            onPress={handleAddDestination}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.expandedAddButtonText}>+ Add New Destination</Text>
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
    destinationsList: {
        flex: 1,
    },
    destinationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        padding: 8,
        marginBottom: 6,
    },
    destinationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    emoji: {
        fontSize: 16,
        marginRight: 8,
    },
    destinationInfo: {
        flex: 1,
    },
    destinationName: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    destinationCountry: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    statusBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    visitedBadge: {
        backgroundColor: 'rgba(76, 217, 100, 0.9)',
    },
    wishlistBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    visitedText: {
        color: 'white',
    },
    wishlistText: {
        color: 'white',
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
        marginBottom: 24,
    },
    expandedStatBox: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
        minWidth: 80,
    },
    expandedStatNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    expandedStatLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    expandedDestinationsList: {
        flex: 1,
    },
    swipeableContainer: {
        marginBottom: 12,
    },
    expandedDestinationItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
    },
    expandedDestinationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    destinationActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    expandedEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    expandedDestinationName: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    expandedDestinationCountry: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    toggleButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
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
    destinationNotes: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontStyle: 'italic',
        lineHeight: 20,
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

export default TravelPinsWidget;