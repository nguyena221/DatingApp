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
import AddMovieScreen from '../components/AddMovieScreen';

const { width, height } = Dimensions.get('window');

const FavoriteMoviesWidget = ({ navigation }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    // Load movies from database when component mounts or regains focus
    useFocusEffect(
        useCallback(() => {
            loadMoviesFromDatabase();
        }, [])
    );

    const loadMoviesFromDatabase = async () => {
        try {
            setLoading(true);
            const userEmail = user?.email || "test2@example.com";
            const result = await getUserWidgetData(userEmail, 'movies');
            
            if (result.success && result.data) {
                setMovies(result.data.movies || []);
            } else {
                console.log("No movies data found, starting with empty array");
                setMovies([]);
            }
        } catch (error) {
            console.error("Error loading movies:", error);
            setMovies([]);
        } finally {
            setLoading(false);
        }
    };

    const averageRating = movies.length > 0 ? (movies.reduce((sum, movie) => sum + movie.rating, 0) / movies.length).toFixed(1) : 0;
    const favoriteGenres = [...new Set(movies.map(m => m.genre))];

    const openExpanded = () => {
        setIsExpanded(true);
    };

    const closeExpanded = () => {
        setIsExpanded(false);
    };

    // Navigate to AddMovie screen
    const handleAddMovie = () => {
        console.log('🎬 Navigating to AddMovie screen');
        console.log('🎬 Navigation object:', navigation);
        
        // Close the expanded modal first
        setIsExpanded(false);
        
        // Then navigate after a small delay to ensure modal is closed
        setTimeout(() => {
            if (navigation && navigation.navigate) {
                navigation.navigate('AddMovie');
            } else {
                console.error('❌ Navigation not available');
                Alert.alert('Error', 'Navigation not available. Please try again.');
            }
        }, 300);
    };

    const openLetterboxdLink = async (url) => {
        if (!url) return;
        
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Unable to open Letterboxd link');
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to open Letterboxd link');
        }
    };

    const handleRemoveMovie = async (movieId) => {
        console.log('🗑️ handleRemoveMovie called with movieId:', movieId);
        
        Alert.alert(
            'Remove Movie',
            'Are you sure you want to remove this movie from your collection?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🗑️ User confirmed deletion');
                            const userEmail = user?.email || "test2@example.com";
                            console.log('🗑️ Removing movie from database for user:', userEmail);
                            
                            const result = await removeWidgetItem(userEmail, 'movies', movieId);
                            console.log('🗑️ Database result:', result);
                            
                            if (result.success) {
                                console.log('✅ Movie removed from database, updating local state');
                                setMovies(prevMovies => {
                                    const updatedMovies = prevMovies.filter(movie => movie.id !== movieId);
                                    console.log('✅ Updated movies array:', updatedMovies);
                                    return updatedMovies;
                                });
                                Alert.alert('Success', 'Movie removed successfully!');
                            } else {
                                console.log('❌ Database removal failed:', result.message);
                                Alert.alert('Error', result.message || 'Failed to remove movie');
                            }
                        } catch (error) {
                            console.error("❌ Error removing movie:", error);
                            Alert.alert('Error', 'Failed to remove movie');
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateMovieRating = async (movieId, newRating) => {
        try {
            const userEmail = user?.email || "test2@example.com";
            const result = await updateWidgetItem(userEmail, 'movies', movieId, { rating: newRating });
            
            if (result.success) {
                setMovies(prevMovies => 
                    prevMovies.map(movie => 
                        movie.id === movieId ? { ...movie, rating: newRating } : movie
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

    const renderStars = (rating, size = 12, interactive = false, movieId = null) => {
        return Array.from({ length: 5 }, (_, i) => (
            <TouchableOpacity
                key={i}
                disabled={!interactive}
                onPress={interactive ? () => handleUpdateMovieRating(movieId, i + 1) : undefined}
                activeOpacity={interactive ? 0.7 : 1}
            >
                <Text style={[styles.star, { fontSize: size }]}>
                    {i < rating ? '★' : '☆'}
                </Text>
            </TouchableOpacity>
        ));
    };

    // Compact Widget View
    const CompactWidget = () => (
        <TouchableOpacity onPress={openExpanded} style={styles.widgetContainer} activeOpacity={0.8}>
            <LinearGradient
                colors={['#ff6b6b', '#feca57']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>🎬 Movie Taste</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.stat}>{movies.length} favorites</Text>
                        <Text style={styles.stat}>★ {averageRating} avg</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading movies...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.moviesList} showsVerticalScrollIndicator={false}>
                        {movies.slice(0, 3).map((movie) => (
                            <View key={movie.id} style={styles.movieItem}>
                                <View style={styles.movieLeft}>
                                    <Text style={styles.poster}>{movie.poster}</Text>
                                    <View style={styles.movieInfo}>
                                        <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                                        <Text style={styles.movieYear}>{movie.year} • {movie.genre}</Text>
                                    </View>
                                </View>
                                <View style={styles.ratingContainer}>
                                    {renderStars(movie.rating)}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.expandHint}>
                    <Text style={styles.expandHintText}>Tap to see all {movies.length} movies</Text>
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
            <StatusBar barStyle="light-content" backgroundColor="#ff6b6b" />
            <LinearGradient
                colors={['#ff6b6b', '#feca57']}
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
                        <Text style={styles.expandedTitle}>🎬 My Movie Collection</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Stats */}
                    <View style={styles.expandedStatsContainer}>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{movies.length}</Text>
                            <Text style={styles.expandedStatLabel}>Movies</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>★ {averageRating}</Text>
                            <Text style={styles.expandedStatLabel}>Avg Rating</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{favoriteGenres.length}</Text>
                            <Text style={styles.expandedStatLabel}>Genres</Text>
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

                    {/* Movies List */}
                    <ScrollView 
                        style={styles.expandedMoviesList} 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {movies.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No movies in your collection yet!</Text>
                                <Text style={styles.emptyStateSubtext}>Add your first movie to get started</Text>
                            </View>
                        ) : (
                            movies.map((movie) => (
                                <View key={movie.id} style={styles.swipeableContainer}>
                                    <TouchableOpacity 
                                        style={styles.expandedMovieItem}
                                        onPress={() => openLetterboxdLink(movie.letterboxdUrl)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.expandedMovieHeader}>
                                            <View style={styles.movieLeft}>
                                                <Text style={styles.expandedPoster}>{movie.poster}</Text>
                                                <View style={styles.movieInfo}>
                                                    <Text style={styles.expandedMovieTitle}>{movie.title}</Text>
                                                    <Text style={styles.expandedMovieYear}>{movie.year} • {movie.genre}</Text>
                                                    <View style={styles.expandedRatingContainer}>
                                                        {renderStars(movie.rating, 16, true, movie.id)}
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={styles.movieActions}>
                                                {movie.letterboxdUrl && (
                                                    <View style={styles.letterboxdIcon}>
                                                        <Text style={styles.letterboxdText}>🎬</Text>
                                                    </View>
                                                )}
                                                {/* Delete Button */}
                                                <TouchableOpacity
                                                    style={styles.deleteIconButton}
                                                    onPress={() => {
                                                        console.log('🗑️ Delete button pressed for movie:', movie.id, movie.title);
                                                        handleRemoveMovie(movie.id);
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.deleteIconText}>🗑️</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {movie.review && (
                                            <Text style={styles.movieReview}>"{movie.review}"</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {/* Add Button */}
                    <TouchableOpacity 
                        style={styles.expandedAddButton}
                        onPress={handleAddMovie}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.expandedAddButtonText}>+ Add New Movie</Text>
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
    moviesList: {
        flex: 1,
    },
    movieItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        padding: 8,
        marginBottom: 6,
    },
    movieLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    poster: {
        fontSize: 16,
        marginRight: 8,
    },
    movieInfo: {
        flex: 1,
    },
    movieTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    movieYear: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    star: {
        color: '#FFD700',
        marginHorizontal: 1,
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
    expandedMoviesList: {
        flex: 1,
    },
    swipeableContainer: {
        marginBottom: 12,
    },
    expandedMovieItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
    },
    expandedMovieHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    movieActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    expandedPoster: {
        fontSize: 24,
        marginRight: 12,
    },
    expandedMovieTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    expandedMovieYear: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 6,
    },
    expandedRatingContainer: {
        flexDirection: 'row',
    },
    letterboxdIcon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    letterboxdText: {
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
    movieReview: {
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

export default FavoriteMoviesWidget;