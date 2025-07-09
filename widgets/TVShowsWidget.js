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

const TVShowsWidget = ({ navigation }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [tvShows, setTVShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    // Load TV shows from database when component mounts or regains focus
    useFocusEffect(
        useCallback(() => {
            loadShowsFromDatabase();
        }, [])
    );

    const loadShowsFromDatabase = async () => {
        try {
            setLoading(true);
            const userEmail = user?.email || "test2@example.com";
            const result = await getUserWidgetData(userEmail, 'tvshows');
            
            if (result.success && result.data) {
                setTVShows(result.data.shows || []);
            } else {
                console.log("No TV shows data found, starting with empty array");
                setTVShows([]);
            }
        } catch (error) {
            console.error("Error loading TV shows:", error);
            setTVShows([]);
        } finally {
            setLoading(false);
        }
    };

    const watchedShows = tvShows.filter(s => s.status === 'watched');
    const averageRating = watchedShows.length > 0 ? (watchedShows.reduce((sum, show) => sum + show.rating, 0) / watchedShows.length).toFixed(1) : 0;
    const favoriteGenres = [...new Set(tvShows.map(s => s.genre))];
    const currentlyWatching = tvShows.filter(s => s.status === 'watching');

    const openExpanded = () => {
        setIsExpanded(true);
    };

    const closeExpanded = () => {
        setIsExpanded(false);
    };

    // Navigate to AddTVShow screen
    const handleAddShow = () => {
        console.log('📺 Navigating to AddTVShow screen');
        console.log('📺 Navigation object:', navigation);
        
        // Close the expanded modal first
        setIsExpanded(false);
        
        // Then navigate after a small delay to ensure modal is closed
        setTimeout(() => {
            if (navigation && navigation.navigate) {
                navigation.navigate('AddTVShow');
            } else {
                console.error('❌ Navigation not available');
                Alert.alert('Error', 'Navigation not available. Please try again.');
            }
        }, 300);
    };

    const openStreamingLink = async (url) => {
        if (!url) return;
        
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Unable to open streaming link');
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to open streaming link');
        }
    };

    const handleRemoveShow = async (showId) => {
        console.log('🗑️ handleRemoveShow called with showId:', showId);
        
        Alert.alert(
            'Remove Show',
            'Are you sure you want to remove this show from your collection?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🗑️ User confirmed deletion');
                            const userEmail = user?.email || "test2@example.com";
                            console.log('🗑️ Removing show from database for user:', userEmail);
                            
                            const result = await removeWidgetItem(userEmail, 'tvshows', showId);
                            console.log('🗑️ Database result:', result);
                            
                            if (result.success) {
                                console.log('✅ Show removed from database, updating local state');
                                setTVShows(prevShows => {
                                    const updatedShows = prevShows.filter(show => show.id !== showId);
                                    console.log('✅ Updated shows array:', updatedShows);
                                    return updatedShows;
                                });
                                Alert.alert('Success', 'Show removed successfully!');
                            } else {
                                console.log('❌ Database removal failed:', result.message);
                                Alert.alert('Error', result.message || 'Failed to remove show');
                            }
                        } catch (error) {
                            console.error("❌ Error removing show:", error);
                            Alert.alert('Error', 'Failed to remove show');
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateShowRating = async (showId, newRating) => {
        try {
            const userEmail = user?.email || "test2@example.com";
            const result = await updateWidgetItem(userEmail, 'tvshows', showId, { rating: newRating });
            
            if (result.success) {
                setTVShows(prevShows => 
                    prevShows.map(show => 
                        show.id === showId ? { ...show, rating: newRating } : show
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

    const renderStars = (rating, size = 12, interactive = false, showId = null) => {
        return Array.from({ length: 5 }, (_, i) => (
            <TouchableOpacity
                key={i}
                disabled={!interactive}
                onPress={interactive ? () => handleUpdateShowRating(showId, i + 1) : undefined}
                activeOpacity={interactive ? 0.7 : 1}
            >
                <Text style={[styles.star, { fontSize: size }]}>
                    {i < rating ? '★' : '☆'}
                </Text>
            </TouchableOpacity>
        ));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'watched': return '#4CAF50';
            case 'watching': return '#FF9800';
            case 'want-to-watch': return '#2196F3';
            default: return '#666';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'watched': return 'Watched';
            case 'watching': return 'Watching';
            case 'want-to-watch': return 'Want to Watch';
            default: return '';
        }
    };

    // Compact Widget View
    const CompactWidget = () => (
        <TouchableOpacity onPress={openExpanded} style={styles.widgetContainer} activeOpacity={0.8}>
            <LinearGradient
                colors={['#2c3e50', '#3498db']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>📺 TV Shows</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.stat}>{watchedShows.length} watched</Text>
                        <Text style={styles.stat}>★ {averageRating} avg</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading shows...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.showsList} showsVerticalScrollIndicator={false}>
                        {tvShows.slice(0, 3).map((show) => (
                            <View key={show.id} style={styles.showItem}>
                                <View style={styles.showLeft}>
                                    <Text style={styles.showEmoji}>{show.emoji}</Text>
                                    <View style={styles.showInfo}>
                                        <Text style={styles.showTitle} numberOfLines={1}>{show.title}</Text>
                                        <Text style={styles.showMeta}>S{show.seasons} • {show.year}</Text>
                                    </View>
                                </View>
                                <View style={styles.compactRightSection}>
                                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(show.status) }]} />
                                    {show.status === 'watched' && (
                                        <View style={styles.ratingContainer}>
                                            {renderStars(show.rating, 10)}
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.expandHint}>
                    <Text style={styles.expandHintText}>Tap to see all {tvShows.length} shows</Text>
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
            <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
            <LinearGradient
                colors={['#2c3e50', '#3498db']}
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
                        <Text style={styles.expandedTitle}>📺 My TV Collection</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Stats */}
                    <View style={styles.expandedStatsContainer}>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{watchedShows.length}</Text>
                            <Text style={styles.expandedStatLabel}>Watched</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>★ {averageRating}</Text>
                            <Text style={styles.expandedStatLabel}>Avg Rating</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{currentlyWatching.length}</Text>
                            <Text style={styles.expandedStatLabel}>Watching</Text>
                        </View>
                    </View>

                    {/* Genre Tags */}
                    {favoriteGenres.length > 0 && (
                        <View style={styles.genreContainer}>
                            <Text style={styles.genreTitle}>Favorite Genres:</Text>
                            <View style={styles.genreTags}>
                                {favoriteGenres.map((genre, index) => (
                                    <View key={index} style={styles.genreTag}>
                                        <Text style={styles.genreText}>{genre}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Shows List */}
                    <ScrollView 
                        style={styles.expandedShowsList} 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {tvShows.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No shows in your collection yet!</Text>
                                <Text style={styles.emptyStateSubtext}>Add your first TV show to get started</Text>
                            </View>
                        ) : (
                            tvShows.map((show) => (
                                <View key={show.id} style={styles.swipeableContainer}>
                                    <TouchableOpacity 
                                        style={styles.expandedShowItem}
                                        onPress={() => openStreamingLink(show.streamingUrl)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.expandedShowHeader}>
                                            <View style={styles.showLeft}>
                                                <Text style={styles.expandedShowEmoji}>{show.emoji}</Text>
                                                <View style={styles.showInfo}>
                                                    <Text style={styles.expandedShowTitle}>{show.title}</Text>
                                                    <Text style={styles.expandedShowMeta}>{show.year} • {show.seasons} Season{show.seasons !== 1 ? 's' : ''} • {show.genre}</Text>
                                                    <View style={styles.expandedShowStatusRow}>
                                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(show.status) }]}>
                                                            <Text style={styles.statusBadgeText}>{getStatusText(show.status)}</Text>
                                                        </View>
                                                        {show.status === 'watched' && (
                                                            <View style={styles.expandedRatingContainer}>
                                                                {renderStars(show.rating, 14, true, show.id)}
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={styles.showActions}>
                                                {show.streamingUrl && (
                                                    <View style={styles.streamingIcon}>
                                                        <Text style={styles.streamingText}>📱</Text>
                                                    </View>
                                                )}
                                                {/* Delete Button */}
                                                <TouchableOpacity
                                                    style={styles.deleteIconButton}
                                                    onPress={() => {
                                                        console.log('🗑️ Delete button pressed for show:', show.id, show.title);
                                                        handleRemoveShow(show.id);
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.deleteIconText}>🗑️</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {show.review && (
                                            <Text style={styles.showReview}>"{show.review}"</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {/* Add Button */}
                    <TouchableOpacity 
                        style={styles.expandedAddButton}
                        onPress={handleAddShow}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.expandedAddButtonText}>+ Add New Show</Text>
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
    showsList: {
        flex: 1,
    },
    showItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        padding: 8,
        marginBottom: 6,
    },
    showLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    showEmoji: {
        fontSize: 16,
        marginRight: 8,
    },
    showInfo: {
        flex: 1,
    },
    showTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    showMeta: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    compactRightSection: {
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: 4,
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
    genreContainer: {
        marginBottom: 20,
    },
    genreTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
    },
    genreTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    genreTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    genreText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    expandedShowsList: {
        flex: 1,
    },
    swipeableContainer: {
        marginBottom: 12,
    },
    expandedShowItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
    },
    expandedShowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    showActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    expandedShowEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    expandedShowTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    expandedShowMeta: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 8,
    },
    expandedShowStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusBadge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    statusBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    expandedRatingContainer: {
        flexDirection: 'row',
    },
    streamingIcon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    streamingText: {
        fontSize: 20,
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
    showReview: {
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

export default TVShowsWidget;