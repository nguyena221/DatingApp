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

const FavoriteBooksWidget = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [books] = useState([
        { 
            id: 1, 
            title: 'The Seven Husbands of Evelyn Hugo', 
            author: 'Taylor Jenkins Reid',
            year: 2017, 
            genre: 'Fiction', 
            rating: 5, 
            status: 'read',
            emoji: '📚',
            review: 'Absolutely captivating! The storytelling was phenomenal and I couldn\'t put it down.',
            goodreadsUrl: 'https://www.goodreads.com/book/show/32620332-the-seven-husbands-of-evelyn-hugo'
        },
        { 
            id: 2, 
            title: 'Project Hail Mary', 
            author: 'Andy Weir',
            year: 2021, 
            genre: 'Sci-Fi', 
            rating: 5, 
            status: 'read',
            emoji: '🚀',
            review: 'Perfect blend of science and humor. Made me laugh and cry at the same time!',
            goodreadsUrl: 'https://www.goodreads.com/book/show/54493401-project-hail-mary'
        },
        { 
            id: 3, 
            title: 'The Midnight Library', 
            author: 'Matt Haig',
            year: 2020, 
            genre: 'Philosophy', 
            rating: 4, 
            status: 'read',
            emoji: '🌙',
            review: 'Beautiful exploration of life\'s possibilities. Really made me think about choices.',
            goodreadsUrl: 'https://www.goodreads.com/book/show/52578297-the-midnight-library'
        },
        { 
            id: 4, 
            title: 'Atomic Habits', 
            author: 'James Clear',
            year: 2018, 
            genre: 'Self-Help', 
            rating: 5, 
            status: 'read',
            emoji: '⚡',
            review: 'Life-changing! Applied so many concepts and actually saw results.',
            goodreadsUrl: 'https://www.goodreads.com/book/show/40121378-atomic-habits'
        },
        { 
            id: 5, 
            title: 'The Song of Achilles', 
            author: 'Madeline Miller',
            year: 2011, 
            genre: 'Fantasy', 
            rating: 4, 
            status: 'read',
            emoji: '⚔️',
            review: 'Beautiful retelling of Greek mythology. The writing was absolutely gorgeous.',
            goodreadsUrl: 'https://www.goodreads.com/book/show/11250317-the-song-of-achilles'
        },
        { 
            id: 6, 
            title: 'Klara and the Sun', 
            author: 'Kazuo Ishiguro',
            year: 2021, 
            genre: 'Sci-Fi', 
            rating: 4, 
            status: 'currently-reading',
            emoji: '☀️',
            review: 'Currently reading - loving the unique perspective so far!',
            goodreadsUrl: 'https://www.goodreads.com/book/show/54120408-klara-and-the-sun'
        },
        { 
            id: 7, 
            title: 'Educated', 
            author: 'Tara Westover',
            year: 2018, 
            genre: 'Memoir', 
            rating: 5, 
            status: 'read',
            emoji: '🎓',
            review: 'Incredible memoir about education and family. Powerful and eye-opening.',
            goodreadsUrl: 'https://www.goodreads.com/book/show/35133922-educated'
        },
        { 
            id: 8, 
            title: 'The Silent Patient', 
            author: 'Alex Michaelides',
            year: 2019, 
            genre: 'Thriller', 
            rating: 3, 
            status: 'want-to-read',
            emoji: '🤫',
            review: 'On my reading list - heard great things about the plot twist!',
            goodreadsUrl: 'https://www.goodreads.com/book/show/40097951-the-silent-patient'
        },
    ]);

    const readBooks = books.filter(b => b.status === 'read');
    const averageRating = readBooks.length > 0 ? (readBooks.reduce((sum, book) => sum + book.rating, 0) / readBooks.length).toFixed(1) : 0;
    const favoriteGenres = [...new Set(books.map(b => b.genre))];
    const currentlyReading = books.filter(b => b.status === 'currently-reading');

    const openExpanded = () => {
        setIsExpanded(true);
    };

    const closeExpanded = () => {
        setIsExpanded(false);
    };

    const openGoodreadsLink = async (url) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Unable to open Goodreads link');
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to open Goodreads link');
        }
    };

    const renderStars = (rating, size = 12) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Text key={i} style={[styles.star, { fontSize: size }]}>
                {i < rating ? '★' : '☆'}
            </Text>
        ));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'read': return '#4CAF50';
            case 'currently-reading': return '#FF9800';
            case 'want-to-read': return '#2196F3';
            default: return '#666';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'read': return 'Read';
            case 'currently-reading': return 'Reading';
            case 'want-to-read': return 'Want to Read';
            default: return '';
        }
    };

    // Compact Widget View
    const CompactWidget = () => (
        <TouchableOpacity onPress={openExpanded} style={styles.widgetContainer}>
            <LinearGradient
                colors={['#8e44ad', '#3498db']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>📖 Book Shelf</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.stat}>{readBooks.length} read</Text>
                        <Text style={styles.stat}>★ {averageRating} avg</Text>
                    </View>
                </View>

                <ScrollView style={styles.booksList} showsVerticalScrollIndicator={false}>
                    {books.slice(0, 3).map((book) => (
                        <View key={book.id} style={styles.bookItem}>
                            <View style={styles.bookLeft}>
                                <Text style={styles.bookEmoji}>{book.emoji}</Text>
                                <View style={styles.bookInfo}>
                                    <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                                    <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
                                </View>
                            </View>
                            <View style={styles.compactRightSection}>
                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(book.status) }]} />
                                {book.status === 'read' && (
                                    <View style={styles.ratingContainer}>
                                        {renderStars(book.rating, 10)}
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.expandHint}>
                    <Text style={styles.expandHintText}>Tap to see all {books.length} books</Text>
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
            <StatusBar barStyle="light-content" backgroundColor="#8e44ad" />
            <LinearGradient
                colors={['#8e44ad', '#3498db']}
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
                        <Text style={styles.expandedTitle}>📖 My Reading Journey</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Stats */}
                    <View style={styles.expandedStatsContainer}>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{readBooks.length}</Text>
                            <Text style={styles.expandedStatLabel}>Books Read</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>★ {averageRating}</Text>
                            <Text style={styles.expandedStatLabel}>Avg Rating</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{currentlyReading.length}</Text>
                            <Text style={styles.expandedStatLabel}>Reading Now</Text>
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

                    {/* Books List */}
                    <ScrollView style={styles.expandedBooksList} showsVerticalScrollIndicator={false}>
                        {books.map((book) => (
                            <TouchableOpacity 
                                key={book.id} 
                                style={styles.expandedBookItem}
                                onPress={() => openGoodreadsLink(book.goodreadsUrl)}
                            >
                                <View style={styles.expandedBookHeader}>
                                    <View style={styles.bookLeft}>
                                        <Text style={styles.expandedBookEmoji}>{book.emoji}</Text>
                                        <View style={styles.bookInfo}>
                                            <Text style={styles.expandedBookTitle}>{book.title}</Text>
                                            <Text style={styles.expandedBookAuthor}>by {book.author} ({book.year})</Text>
                                            <View style={styles.expandedBookMeta}>
                                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(book.status) }]}>
                                                    <Text style={styles.statusBadgeText}>{getStatusText(book.status)}</Text>
                                                </View>
                                                {book.status === 'read' && (
                                                    <View style={styles.expandedRatingContainer}>
                                                        {renderStars(book.rating, 14)}
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.goodreadsIcon}>
                                        <Text style={styles.goodreadsText}>📱</Text>
                                    </View>
                                </View>
                                {book.review && (
                                    <Text style={styles.bookReview}>"{book.review}"</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Add Button */}
                    <TouchableOpacity style={styles.expandedAddButton}>
                        <Text style={styles.expandedAddButtonText}>+ Add New Book</Text>
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
    booksList: {
        flex: 1,
    },
    bookItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        padding: 8,
        marginBottom: 6,
    },
    bookLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    bookEmoji: {
        fontSize: 16,
        marginRight: 8,
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    bookAuthor: {
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
    expandedBooksList: {
        flex: 1,
    },
    expandedBookItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    expandedBookHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    expandedBookEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    expandedBookTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    expandedBookAuthor: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 8,
    },
    expandedBookMeta: {
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
    goodreadsIcon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    goodreadsText: {
        fontSize: 20,
    },
    bookReview: {
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

export default FavoriteBooksWidget;