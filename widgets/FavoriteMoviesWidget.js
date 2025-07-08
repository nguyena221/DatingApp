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

const FavoriteMoviesWidget = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [movies] = useState([
        { 
            id: 1, 
            title: 'Inception', 
            year: 2010, 
            genre: 'Sci-Fi', 
            rating: 5, 
            poster: '🎭',
            review: 'Mind-bending masterpiece! The layers of dreams within dreams had me thinking for days.',
            letterboxdUrl: 'https://letterboxd.com/film/inception/'
        },
        { 
            id: 2, 
            title: 'Parasite', 
            year: 2019, 
            genre: 'Thriller', 
            rating: 5, 
            poster: '🏠',
            review: 'Brilliant social commentary. Every scene was perfectly crafted.',
            letterboxdUrl: 'https://letterboxd.com/film/parasite-2019/'
        },
        { 
            id: 3, 
            title: 'La La Land', 
            year: 2016, 
            genre: 'Musical', 
            rating: 4, 
            poster: '🎵',
            review: 'Beautiful cinematography and music, though the ending broke my heart!',
            letterboxdUrl: 'https://letterboxd.com/film/la-la-land/'
        },
        { 
            id: 4, 
            title: 'Dune', 
            year: 2021, 
            genre: 'Sci-Fi', 
            rating: 4, 
            poster: '🏜️',
            review: 'Stunning visuals and sound design. Can\'t wait for Part Two!',
            letterboxdUrl: 'https://letterboxd.com/film/dune-2021/'
        },
        { 
            id: 5, 
            title: 'Everything Everywhere All at Once', 
            year: 2022, 
            genre: 'Adventure', 
            rating: 5, 
            poster: '🌀',
            review: 'Chaotic, emotional, and absolutely brilliant. A true cinematic experience.',
            letterboxdUrl: 'https://letterboxd.com/film/everything-everywhere-all-at-once/'
        },
        { 
            id: 6, 
            title: 'The Grand Budapest Hotel', 
            year: 2014, 
            genre: 'Comedy', 
            rating: 4, 
            poster: '🏨',
            review: 'Wes Anderson\'s visual style is unmatched. Charming and whimsical.',
            letterboxdUrl: 'https://letterboxd.com/film/the-grand-budapest-hotel/'
        },
    ]);

    const averageRating = (movies.reduce((sum, movie) => sum + movie.rating, 0) / movies.length).toFixed(1);
    const favoriteGenres = [...new Set(movies.map(m => m.genre))];

    const openExpanded = () => {
        setIsExpanded(true);
    };

    const closeExpanded = () => {
        setIsExpanded(false);
    };

    const openLetterboxdLink = async (url) => {
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

    const renderStars = (rating, size = 12) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Text key={i} style={[styles.star, { fontSize: size }]}>
                {i < rating ? '★' : '☆'}
            </Text>
        ));
    };

    // Compact Widget View
    const CompactWidget = () => (
        <TouchableOpacity onPress={openExpanded} style={styles.widgetContainer}>
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
            presentationStyle="pageSheet"
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
                        <TouchableOpacity onPress={closeExpanded} style={styles.closeButton}>
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

                    {/* Movies List */}
                    <ScrollView style={styles.expandedMoviesList} showsVerticalScrollIndicator={false}>
                        {movies.map((movie) => (
                            <TouchableOpacity 
                                key={movie.id} 
                                style={styles.expandedMovieItem}
                                onPress={() => openLetterboxdLink(movie.letterboxdUrl)}
                            >
                                <View style={styles.expandedMovieHeader}>
                                    <View style={styles.movieLeft}>
                                        <Text style={styles.expandedPoster}>{movie.poster}</Text>
                                        <View style={styles.movieInfo}>
                                            <Text style={styles.expandedMovieTitle}>{movie.title}</Text>
                                            <Text style={styles.expandedMovieYear}>{movie.year} • {movie.genre}</Text>
                                            <View style={styles.expandedRatingContainer}>
                                                {renderStars(movie.rating, 16)}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.letterboxdIcon}>
                                        <Text style={styles.letterboxdText}>🎬</Text>
                                    </View>
                                </View>
                                {movie.review && (
                                    <Text style={styles.movieReview}>"{movie.review}"</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Add Button */}
                    <TouchableOpacity style={styles.expandedAddButton}>
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
    expandedMovieItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    expandedMovieHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
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
});

export default FavoriteMoviesWidget;