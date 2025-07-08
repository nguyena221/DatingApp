import React, { useState } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity, 
    ScrollView, 
    Modal, 
    Dimensions,
    SafeAreaView,
    StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const TravelPinsWidget = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [destinations] = useState([
        { id: 1, name: 'Tokyo', country: 'Japan', emoji: '🗾', visited: false, notes: 'Want to see cherry blossoms and try authentic ramen!' },
        { id: 2, name: 'Paris', country: 'France', emoji: '🥖', visited: true, notes: 'Amazing museums and food. Eiffel Tower was breathtaking!' },
        { id: 3, name: 'Bali', country: 'Indonesia', emoji: '🏝️', visited: false, notes: 'Perfect for relaxation and beautiful temples.' },
        { id: 4, name: 'New York', country: 'USA', emoji: '🗽', visited: true, notes: 'The city that never sleeps! Broadway was incredible.' },
        { id: 5, name: 'Iceland', country: 'Iceland', emoji: '🏔️', visited: false, notes: 'Northern lights and hot springs are calling my name.' },
        { id: 6, name: 'Morocco', country: 'Morocco', emoji: '🐪', visited: false, notes: 'Excited to explore the souks in Marrakech.' },
        { id: 7, name: 'Thailand', country: 'Thailand', emoji: '🏝️', visited: false, notes: 'Beaches, temples, and amazing street food!' },
        { id: 8, name: 'Greece', country: 'Greece', emoji: '🏛️', visited: true, notes: 'Santorini sunsets were magical. History everywhere!' },
    ]);

    const wishlistCount = destinations.filter(d => !d.visited).length;
    const visitedCount = destinations.filter(d => d.visited).length;

    const openExpanded = () => {
        setIsExpanded(true);
    };

    const closeExpanded = () => {
        setIsExpanded(false);
    };

    // Compact Widget View
    const CompactWidget = () => (
        <TouchableOpacity onPress={openExpanded} style={styles.widgetContainer}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>✈️ Travel Dreams</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.stat}>{visitedCount} visited</Text>
                        <Text style={styles.stat}>{wishlistCount} wishlist</Text>
                    </View>
                </View>

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
            presentationStyle="pageSheet"
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
                        <TouchableOpacity onPress={closeExpanded} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.expandedTitle}>✈️ My Travel Dreams</Text>
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
                    <ScrollView style={styles.expandedDestinationsList} showsVerticalScrollIndicator={false}>
                        {destinations.map((destination) => (
                            <TouchableOpacity key={destination.id} style={styles.expandedDestinationItem}>
                                <View style={styles.expandedDestinationHeader}>
                                    <View style={styles.destinationLeft}>
                                        <Text style={styles.expandedEmoji}>{destination.emoji}</Text>
                                        <View style={styles.destinationInfo}>
                                            <Text style={styles.expandedDestinationName}>{destination.name}</Text>
                                            <Text style={styles.expandedDestinationCountry}>{destination.country}</Text>
                                        </View>
                                    </View>
                                    <View style={[
                                        styles.expandedStatusBadge, 
                                        destination.visited ? styles.visitedBadge : styles.wishlistBadge
                                    ]}>
                                        <Text style={[
                                            styles.expandedStatusText,
                                            destination.visited ? styles.visitedText : styles.wishlistText
                                        ]}>
                                            {destination.visited ? '✓' : '♡'}
                                        </Text>
                                    </View>
                                </View>
                                {destination.notes && (
                                    <Text style={styles.destinationNotes}>{destination.notes}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Add Button */}
                    <TouchableOpacity style={styles.expandedAddButton}>
                        <Text style={styles.expandedAddButtonText}>+ Add New Destination</Text>
                    </TouchableOpacity>
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
    expandedDestinationItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    expandedDestinationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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
    expandedStatusBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedStatusText: {
        fontSize: 16,
        fontWeight: 'bold',
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
});

export default TravelPinsWidget;