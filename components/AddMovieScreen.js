import React, { useState } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    SafeAreaView, 
    TouchableOpacity, 
    StatusBar, 
    ScrollView, 
    TextInput,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../contexts/UserContext';
import { addWidgetItem } from '../backend/UserService';

export default function AddMovieScreen({ navigation }) {
    const { user } = useUser();
    
    // Form state for new movie
    const [newMovie, setNewMovie] = useState({
        title: '',
        year: new Date().getFullYear(),
        genre: 'Action',
        rating: 0,
        poster: '🎬',
        review: '',
        letterboxdUrl: ''
    });

    const genreOptions = [
        'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 
        'Drama', 'Fantasy', 'Horror', 'Musical', 'Mystery', 'Romance', 
        'Sci-Fi', 'Thriller', 'War', 'Western'
    ];

    const posterOptions = ['🎬', '🎭', '🎪', '🎨', '🎵', '🎸', '🎤', '🎯', '🎲', '🎳'];

    const handleSave = async () => {
        console.log('💾 handleSave called');
        console.log('💾 Current newMovie state:', newMovie);
        
        if (!newMovie.title.trim()) {
            console.log('❌ Validation failed - missing title');
            Alert.alert('Error', 'Please fill in at least the movie title');
            return;
        }

        try {
            console.log('💾 Starting database save...');
            const userEmail = user?.email || "test2@example.com";
            console.log('💾 Using email:', userEmail);
            
            const result = await addWidgetItem(userEmail, 'movies', newMovie);
            console.log('💾 Database result:', result);
            
            if (result.success) {
                console.log('✅ Movie added successfully');
                Alert.alert('Success', 'Movie added successfully!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            console.log('✅ Navigating back');
                            navigation.goBack();
                        }
                    }
                ]);
            } else {
                console.log('❌ Database save failed:', result.message);
                Alert.alert('Error', result.message || 'Failed to add movie');
            }
        } catch (error) {
            console.error("❌ Error adding movie:", error);
            Alert.alert('Error', 'Failed to add movie');
        }
    };

    const handleCancel = () => {
        console.log('🔴 Cancel button pressed');
        navigation.goBack();
    };

    return (
        <View style={styles.fullContainer}>
            <StatusBar backgroundColor="#ff6b6b" barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient
                    colors={['#ff6b6b', '#feca57']}
                    style={styles.container}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Header with Save Button */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add New Movie</Text>
                        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        style={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 50 }}
                    >
                        <View style={styles.formContainer}>
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Title *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newMovie.title}
                                    onChangeText={(text) => {
                                        console.log('📝 Title changed to:', text);
                                        setNewMovie(prev => ({ ...prev, title: text }));
                                    }}
                                    placeholder="Enter movie title"
                                    returnKeyType="next"
                                    autoCapitalize="words"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Year</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newMovie.year.toString()}
                                    onChangeText={(text) => {
                                        const year = parseInt(text) || new Date().getFullYear();
                                        console.log('📝 Year changed to:', year);
                                        setNewMovie(prev => ({ ...prev, year }));
                                    }}
                                    placeholder="Release year"
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    maxLength={4}
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Rating</Text>
                                <View style={styles.ratingSelector}>
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            onPress={() => {
                                                console.log('📝 Rating changed to:', i + 1);
                                                setNewMovie(prev => ({ ...prev, rating: i + 1 }));
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.star}>
                                                {i < newMovie.rating ? '★' : '☆'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Genre</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.genreSelector}>
                                        {genreOptions.map(genre => (
                                            <TouchableOpacity
                                                key={genre}
                                                style={[
                                                    styles.genreOption,
                                                    newMovie.genre === genre && styles.selectedGenreOption
                                                ]}
                                                onPress={() => {
                                                    console.log('📝 Genre changed to:', genre);
                                                    setNewMovie(prev => ({ ...prev, genre }));
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.genreOptionText,
                                                    newMovie.genre === genre && styles.selectedGenreOptionText
                                                ]}>
                                                    {genre}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Poster Emoji</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.posterSelector}>
                                        {posterOptions.map(poster => (
                                            <TouchableOpacity
                                                key={poster}
                                                style={[
                                                    styles.posterOption,
                                                    newMovie.poster === poster && styles.selectedPosterOption
                                                ]}
                                                onPress={() => {
                                                    console.log('📝 Poster changed to:', poster);
                                                    setNewMovie(prev => ({ ...prev, poster }));
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.posterOptionText}>{poster}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Review/Notes</Text>
                                <TextInput
                                    style={[styles.formInput, styles.reviewInput]}
                                    value={newMovie.review}
                                    onChangeText={(text) => {
                                        console.log('📝 Review changed to:', text);
                                        setNewMovie(prev => ({ ...prev, review: text }));
                                    }}
                                    placeholder="Your thoughts about this movie..."
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    returnKeyType="done"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Letterboxd URL (Optional)</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newMovie.letterboxdUrl}
                                    onChangeText={(text) => {
                                        console.log('📝 Letterboxd URL changed to:', text);
                                        setNewMovie(prev => ({ ...prev, letterboxdUrl: text }));
                                    }}
                                    placeholder="https://letterboxd.com/film/..."
                                    keyboardType="url"
                                    returnKeyType="done"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>
                        </View>
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { 
        flex: 1, 
        backgroundColor: '#ff6b6b' 
    },
    container: { 
        flex: 1 
    },
    safeArea: { 
        flex: 1 
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    cancelButton: { 
        padding: 8 
    },
    cancelText: { 
        fontSize: 16, 
        color: 'rgba(255, 255, 255, 0.9)', 
        fontWeight: '500' 
    },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: 'white' 
    },
    saveButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    saveText: { 
        fontSize: 16, 
        color: 'white', 
        fontWeight: '600' 
    },
    scrollContainer: { 
        flex: 1 
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    formField: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
    },
    formInput: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
    },
    reviewInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    
    // Rating selector
    ratingSelector: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        paddingVertical: 8,
    },
    star: {
        fontSize: 28,
        color: '#FFD700',
    },
    
    // Genre selector
    genreSelector: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 8,
    },
    genreOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    selectedGenreOption: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'white',
    },
    genreOptionText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '500',
    },
    selectedGenreOptionText: {
        color: '#333',
        fontWeight: '600',
    },
    
    // Poster selector
    posterSelector: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 8,
    },
    posterOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    selectedPosterOption: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'white',
    },
    posterOptionText: {
        fontSize: 24,
    },
});