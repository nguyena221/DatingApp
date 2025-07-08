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
    StatusBar,
    Linking,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const FoodieSpotsWidget = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [foodieSpots] = useState([
        { 
            id: 1, 
            name: 'Joe\'s Pizza', 
            cuisine: 'Italian',
            location: 'Greenwich Village, NYC',
            priceRange: '$$', 
            rating: 5, 
            emoji: '🍕',
            category: 'casual',
            review: 'Best slice in the city! The cheese pull is legendary and it\'s been my go-to since college.',
            signature: 'Classic NY slice',
            visited: '2023-12-15'
        },
        { 
            id: 2, 
            name: 'Eleven Madison Park', 
            cuisine: 'Fine Dining',
            location: 'Flatiron, NYC',
            priceRange: '$$$$', 
            rating: 4, 
            emoji: '🌱',
            category: 'fine-dining',
            review: 'Incredible plant-based tasting menu. Every course was a work of art!',
            signature: 'Seasonal tasting menu',
            visited: '2023-10-22'
        },
        { 
            id: 3, 
            name: 'Tacos El Gordo', 
            cuisine: 'Mexican',
            location: 'Chula Vista, CA',
            priceRange: '$', 
            rating: 5, 
            emoji: '🌮',
            category: 'street-food',
            review: 'Authentic Tijuana-style tacos. The al pastor is unmatched - crispy edges, perfect spice!',
            signature: 'Al pastor tacos',
            visited: '2024-01-08'
        },
        { 
            id: 4, 
            name: 'Atelier Crenn', 
            cuisine: 'French',
            location: 'San Francisco, CA',
            priceRange: '$$$$', 
            rating: 5, 
            emoji: '🇫🇷',
            category: 'fine-dining',
            review: 'Poetic cuisine at its finest. Dominique Crenn is a true artist. Life-changing experience!',
            signature: 'Poetic culinaire',
            visited: '2023-09-14'
        },
        { 
            id: 5, 
            name: 'Katz\'s Delicatessen', 
            cuisine: 'Jewish Deli',
            location: 'Lower East Side, NYC',
            priceRange: '$$', 
            rating: 4, 
            emoji: '🥪',
            category: 'iconic',
            review: 'The pastrami sandwich is enormous and delicious. So much history in every bite!',
            signature: 'Pastrami on rye',
            visited: '2023-11-30'
        },
        { 
            id: 6, 
            name: 'Franklin Barbecue', 
            cuisine: 'BBQ',
            location: 'Austin, TX',
            priceRange: '$$', 
            rating: 5, 
            emoji: '🔥',
            category: 'bbq',
            review: 'Worth the 3-hour wait! The brisket literally melts in your mouth. BBQ perfection.',
            signature: 'Beef brisket',
            visited: '2023-08-05'
        },
        { 
            id: 7, 
            name: 'Night + Market', 
            cuisine: 'Thai',
            location: 'West Hollywood, CA',
            priceRange: '$$', 
            rating: 4, 
            emoji: '🌶️',
            category: 'trendy',
            review: 'Modern Thai with serious heat! The larb and som tam are incredibly authentic.',
            signature: 'Larb gai',
            visited: '2024-02-12'
        },
        { 
            id: 8, 
            name: 'Prince Street Pizza', 
            cuisine: 'Pizza',
            location: 'SoHo, NYC',
            priceRange: '$$', 
            rating: 4, 
            emoji: '🍕',
            category: 'casual',
            review: 'Square slices with perfect caramelized cheese. Always a line but moves fast!',
            signature: 'Pepperoni square',
            visited: '2024-01-22'
        },
    ]);

    const averageRating = (foodieSpots.reduce((sum, spot) => sum + spot.rating, 0) / foodieSpots.length).toFixed(1);
    const uniqueCuisines = [...new Set(foodieSpots.map(s => s.cuisine))];
    const fineDiningCount = foodieSpots.filter(s => s.category === 'fine-dining').length;
    
    const openExpanded = () => {
        setIsExpanded(true);
    };

    const closeExpanded = () => {
        setIsExpanded(false);
    };

    const renderStars = (rating, size = 12) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Text key={i} style={[styles.star, { fontSize: size }]}>
                {i < rating ? '★' : '☆'}
            </Text>
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

    // Compact Widget View
    const CompactWidget = () => (
        <TouchableOpacity onPress={openExpanded} style={styles.widgetContainer}>
            <LinearGradient
                colors={['#e74c3c', '#f39c12']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>🍽️ Foodie Spots</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.stat}>{foodieSpots.length} spots</Text>
                        <Text style={styles.stat}>★ {averageRating} avg</Text>
                    </View>
                </View>

                <ScrollView style={styles.spotsList} showsVerticalScrollIndicator={false}>
                    {foodieSpots.slice(0, 3).map((spot) => (
                        <View key={spot.id} style={styles.spotItem}>
                            <View style={styles.spotLeft}>
                                <Text style={styles.spotEmoji}>{spot.emoji}</Text>
                                <View style={styles.spotInfo}>
                                    <Text style={styles.spotName} numberOfLines={1}>{spot.name}</Text>
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
            presentationStyle="pageSheet"
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
                        <TouchableOpacity onPress={closeExpanded} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.expandedTitle}>🍽️ My Foodie Journey</Text>
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

                    {/* Spots List */}
                    <ScrollView style={styles.expandedSpotsList} showsVerticalScrollIndicator={false}>
                        {foodieSpots.map((spot) => (
                            <TouchableOpacity key={spot.id} style={styles.expandedSpotItem}>
                                <View style={styles.expandedSpotHeader}>
                                    <View style={styles.spotLeft}>
                                        <Text style={styles.expandedSpotEmoji}>{spot.emoji}</Text>
                                        <View style={styles.spotInfo}>
                                            <Text style={styles.expandedSpotName}>{spot.name}</Text>
                                            <Text style={styles.expandedSpotLocation}>{spot.location}</Text>
                                            <View style={styles.expandedSpotMeta}>
                                                <Text style={styles.expandedSpotCuisine}>{spot.cuisine}</Text>
                                                <View style={[styles.priceTag, { backgroundColor: getPriceColor(spot.priceRange) }]}>
                                                    <Text style={styles.priceText}>{spot.priceRange}</Text>
                                                </View>
                                                <View style={styles.expandedRatingContainer}>
                                                    {renderStars(spot.rating, 14)}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
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
                                
                                <View style={styles.visitedContainer}>
                                    <Text style={styles.visitedText}>Visited: {new Date(spot.visited).toLocaleDateString()}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Add Button */}
                    <TouchableOpacity style={styles.expandedAddButton}>
                        <Text style={styles.expandedAddButtonText}>+ Add New Spot</Text>
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
    expandedSpotItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    expandedSpotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
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
});

export default FoodieSpotsWidget;