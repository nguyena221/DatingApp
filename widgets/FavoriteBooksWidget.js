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
    Alert,
    Animated
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

const FavoriteBooksWidget = ({ navigation }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    // Load books from database when component mounts or regains focus
    useFocusEffect(
        useCallback(() => {
            loadBooksFromDatabase();
        }, [])
    );

    const loadBooksFromDatabase = async () => {
        try {
            setLoading(true);
            const userEmail = user?.email || "test2@example.com";
            const result = await getUserWidgetData(userEmail, 'books');
            
            if (result.success && result.data) {
                setBooks(result.data.books || []);
            } else {
                console.log("No books data found, starting with empty array");
                setBooks([]);
            }
        } catch (error) {
            console.error("Error loading books:", error);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

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

    // Navigate to AddBook screen (similar to EditProfile navigation)
    const handleAddBook = () => {
        console.log('📚 Navigating to AddBook screen');
        console.log('📚 Navigation object:', navigation);
        
        // Close the expanded modal first
        setIsExpanded(false);
        
        // Then navigate after a small delay to ensure modal is closed
        setTimeout(() => {
            if (navigation && navigation.navigate) {
                navigation.navigate('AddBook');
            } else {
                console.error('❌ Navigation not available');
                Alert.alert('Error', 'Navigation not available. Please try again.');
            }
        }, 300); // Small delay to ensure modal close animation completes
    };

    const openGoodreadsLink = async (url) => {
        if (!url) return;
        
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

    const handleRemoveBook = async (bookId) => {
        console.log('🗑️ handleRemoveBook called with bookId:', bookId);
        
        Alert.alert(
            'Remove Book',
            'Are you sure you want to remove this book from your collection?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🗑️ User confirmed deletion');
                            const userEmail = user?.email || "test2@example.com";
                            console.log('🗑️ Removing book from database for user:', userEmail);
                            
                            const result = await removeWidgetItem(userEmail, 'books', bookId);
                            console.log('🗑️ Database result:', result);
                            
                            if (result.success) {
                                console.log('✅ Book removed from database, updating local state');
                                setBooks(prevBooks => {
                                    const updatedBooks = prevBooks.filter(book => book.id !== bookId);
                                    console.log('✅ Updated books array:', updatedBooks);
                                    return updatedBooks;
                                });
                                Alert.alert('Success', 'Book removed successfully!');
                            } else {
                                console.log('❌ Database removal failed:', result.message);
                                Alert.alert('Error', result.message || 'Failed to remove book');
                            }
                        } catch (error) {
                            console.error("❌ Error removing book:", error);
                            Alert.alert('Error', 'Failed to remove book');
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateBookRating = async (bookId, newRating) => {
        try {
            const userEmail = user?.email || "test2@example.com";
            const result = await updateWidgetItem(userEmail, 'books', bookId, { rating: newRating });
            
            if (result.success) {
                setBooks(prevBooks => 
                    prevBooks.map(book => 
                        book.id === bookId ? { ...book, rating: newRating } : book
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

    const renderStars = (rating, size = 12, interactive = false, bookId = null) => {
        return Array.from({ length: 5 }, (_, i) => (
            <TouchableOpacity
                key={i}
                disabled={!interactive}
                onPress={interactive ? () => handleUpdateBookRating(bookId, i + 1) : undefined}
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

    // Swipeable book item component
    const SwipeableBookItem = ({ book, onRemove, children }) => {
        const translateX = new Animated.Value(0);

        const onSwipeLeft = () => {
            Animated.timing(translateX, {
                toValue: -80,
                duration: 200,
                useNativeDriver: true,
            }).start();
        };

        const onSwipeRight = () => {
            Animated.timing(translateX, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        };

        return (
            <View style={styles.swipeableContainer}>
                <View style={styles.deleteBackground}>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                            console.log('🗑️ Delete button pressed for book:', book.id);
                            onRemove(book.id);
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                </View>
                <Animated.View
                    style={[
                        styles.swipeableContent,
                        { transform: [{ translateX }] }
                    ]}
                >
                    <TouchableOpacity
                        onLongPress={onSwipeLeft}
                        onPress={onSwipeRight}
                        style={styles.bookItemTouchable}
                        activeOpacity={0.7}
                    >
                        {children}
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    };

    // Compact Widget View
    const CompactWidget = () => (
        <TouchableOpacity onPress={openExpanded} style={styles.widgetContainer} activeOpacity={0.8}>
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

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading books...</Text>
                    </View>
                ) : (
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
                )}

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
            presentationStyle="fullScreen"
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
                        <TouchableOpacity onPress={closeExpanded} style={styles.closeButton} activeOpacity={0.7}>
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

                    {/* Books List */}
                    <ScrollView 
                        style={styles.expandedBooksList} 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {books.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No books in your collection yet!</Text>
                                <Text style={styles.emptyStateSubtext}>Add your first book to get started</Text>
                            </View>
                        ) : (
                            books.map((book) => (
                                <View key={book.id} style={styles.swipeableContainer}>
                                    <TouchableOpacity 
                                        style={styles.expandedBookItem}
                                        onPress={() => openGoodreadsLink(book.goodreadsUrl)}
                                        activeOpacity={0.7}
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
                                                                {renderStars(book.rating, 14, true, book.id)}
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={styles.bookActions}>
                                                {book.goodreadsUrl && (
                                                    <View style={styles.goodreadsIcon}>
                                                        <Text style={styles.goodreadsText}>📱</Text>
                                                    </View>
                                                )}
                                                {/* ✅ ADD VISIBLE DELETE BUTTON */}
                                                <TouchableOpacity
                                                    style={styles.deleteIconButton}
                                                    onPress={() => {
                                                        console.log('🗑️ Delete button pressed for book:', book.id, book.title);
                                                        handleRemoveBook(book.id);
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.deleteIconText}>🗑️</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {book.review && (
                                            <Text style={styles.bookReview}>"{book.review}"</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {/* Add Button - Navigate like EditProfile */}
                    <TouchableOpacity 
                        style={styles.expandedAddButton}
                        onPress={handleAddBook}
                        activeOpacity={0.8}
                    >
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
    expandedBooksList: {
        flex: 1,
    },
    expandedBookItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
    },
    expandedBookHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bookActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
    
    // Swipeable item styles
    swipeableContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    deleteBackground: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 80,
        backgroundColor: '#ff4757',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 24,
    },
    swipeableContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
    },
    bookItemTouchable: {
        width: '100%',
    },
});

export default FavoriteBooksWidget;