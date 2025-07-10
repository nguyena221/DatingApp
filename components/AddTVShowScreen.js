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

export default function AddTVShowScreen({ navigation }) {
    const { user } = useUser();
    
    // Form state for new TV show
    const [newShow, setNewShow] = useState({
        title: '',
        year: new Date().getFullYear(),
        seasons: 1,
        genre: 'Drama',
        rating: 0,
        status: 'want-to-watch',
        emoji: '📺',
        review: '',
        streamingUrl: ''
    });

    const statusOptions = [
        { value: 'watched', label: 'Watched', color: '#4CAF50' },
        { value: 'watching', label: 'Watching', color: '#FF9800' },
        { value: 'want-to-watch', label: 'Want to Watch', color: '#2196F3' }
    ];

    const genreOptions = [
        'Drama', 'Comedy', 'Action', 'Thriller', 'Horror', 'Sci-Fi', 'Fantasy', 
        'Romance', 'Documentary', 'Reality', 'Animation', 'Crime', 'Mystery',
        'Adventure', 'Family', 'Musical', 'Western', 'War', 'Biography', 'History'
    ];

    const emojiOptions = ['📺', '🎭', '😂', '🔫', '👻', '🚀', '🧙‍♂️', '💕', '🔍', '🎪'];

    const handleSave = async () => {
        console.log('💾 handleSave called');
        console.log('💾 Current newShow state:', newShow);
        
        if (!newShow.title.trim()) {
            console.log('❌ Validation failed - missing title');
            Alert.alert('Error', 'Please fill in at least the show title');
            return;
        }

        try {
            console.log('💾 Starting database save...');
            const userEmail = user?.email || "test2@example.com";
            console.log('💾 Using email:', userEmail);
            
            const result = await addWidgetItem(userEmail, 'tvshows', newShow);
            console.log('💾 Database result:', result);
            
            if (result.success) {
                console.log('✅ TV show added successfully');
                Alert.alert('Success', 'TV show added successfully!', [
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
                Alert.alert('Error', result.message || 'Failed to add TV show');
            }
        } catch (error) {
            console.error("❌ Error adding TV show:", error);
            Alert.alert('Error', 'Failed to add TV show');
        }
    };

    const handleCancel = () => {
        console.log('🔴 Cancel button pressed');
        navigation.goBack();
    };

    return (
        <View style={styles.fullContainer}>
            <StatusBar backgroundColor="#2c3e50" barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient
                    colors={['#2c3e50', '#3498db']}
                    style={styles.container}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Header with Save Button */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add New Show</Text>
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
                                <Text style={styles.formLabel}>Show Title *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newShow.title}
                                    onChangeText={(text) => {
                                        console.log('📝 Title changed to:', text);
                                        setNewShow(prev => ({ ...prev, title: text }));
                                    }}
                                    placeholder="Enter show title"
                                    returnKeyType="next"
                                    autoCapitalize="words"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Year</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newShow.year.toString()}
                                    onChangeText={(text) => {
                                        const year = parseInt(text) || new Date().getFullYear();
                                        console.log('📝 Year changed to:', year);
                                        setNewShow(prev => ({ ...prev, year }));
                                    }}
                                    placeholder="Release year"
                                    keyboardType="numeric"
                                    returnKeyType="next"
                                    maxLength={4}
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Number of Seasons</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newShow.seasons.toString()}
                                    onChangeText={(text) => {
                                        const seasons = parseInt(text) || 1;
                                        console.log('📝 Seasons changed to:', seasons);
                                        setNewShow(prev => ({ ...prev, seasons }));
                                    }}
                                    placeholder="Number of seasons"
                                    keyboardType="numeric"
                                    returnKeyType="next"
                                    maxLength={2}
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Status</Text>
                                <View style={styles.statusSelector}>
                                    {statusOptions.map(status => (
                                        <TouchableOpacity
                                            key={status.value}
                                            style={[
                                                styles.statusOption,
                                                { backgroundColor: newShow.status === status.value ? status.color : 'rgba(255, 255, 255, 0.2)' }
                                            ]}
                                            onPress={() => {
                                                console.log('📝 Status changed to:', status.value);
                                                const updatedShow = { ...newShow, status: status.value };
                                                if (status.value !== 'watched') {
                                                    updatedShow.rating = 0; // Reset rating if not watched
                                                }
                                                setNewShow(updatedShow);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[
                                                styles.statusOptionText,
                                                { color: newShow.status === status.value ? 'white' : 'rgba(255, 255, 255, 0.9)' }
                                            ]}>
                                                {status.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {newShow.status === 'watched' && (
                                <View style={styles.formField}>
                                    <Text style={styles.formLabel}>Rating</Text>
                                    <View style={styles.ratingSelector}>
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <TouchableOpacity
                                                key={i}
                                                onPress={() => {
                                                    console.log('📝 Rating changed to:', i + 1);
                                                    setNewShow(prev => ({ ...prev, rating: i + 1 }));
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.star}>
                                                    {i < newShow.rating ? '★' : '☆'}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Genre</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.genreSelector}>
                                        {genreOptions.map(genre => (
                                            <TouchableOpacity
                                                key={genre}
                                                style={[
                                                    styles.genreOption,
                                                    newShow.genre === genre && styles.selectedGenreOption
                                                ]}
                                                onPress={() => {
                                                    console.log('📝 Genre changed to:', genre);
                                                    setNewShow(prev => ({ ...prev, genre }));
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.genreOptionText,
                                                    newShow.genre === genre && styles.selectedGenreOptionText
                                                ]}>
                                                    {genre}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Emoji</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.emojiSelector}>
                                        {emojiOptions.map(emoji => (
                                            <TouchableOpacity
                                                key={emoji}
                                                style={[
                                                    styles.emojiOption,
                                                    newShow.emoji === emoji && styles.selectedEmojiOption
                                                ]}
                                                onPress={() => {
                                                    console.log('📝 Emoji changed to:', emoji);
                                                    setNewShow(prev => ({ ...prev, emoji }));
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.emojiOptionText}>{emoji}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Review/Notes</Text>
                                <TextInput
                                    style={[styles.formInput, styles.reviewInput]}
                                    value={newShow.review}
                                    onChangeText={(text) => {
                                        console.log('📝 Review changed to:', text);
                                        setNewShow(prev => ({ ...prev, review: text }));
                                    }}
                                    placeholder="Your thoughts about this show..."
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    returnKeyType="done"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Streaming URL (Optional)</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newShow.streamingUrl}
                                    onChangeText={(text) => {
                                        console.log('📝 Streaming URL changed to:', text);
                                        setNewShow(prev => ({ ...prev, streamingUrl: text }));
                                    }}
                                    placeholder="Netflix, Hulu, etc. link"
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
        backgroundColor: '#2c3e50' 
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
    
    // Status selector
    statusSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    statusOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    statusOptionText: {
        fontSize: 14,
        fontWeight: '500',
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
    
    // Emoji selector
    emojiSelector: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 8,
    },
    emojiOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    selectedEmojiOption: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'white',
    },
    emojiOptionText: {
        fontSize: 24,
    },
});