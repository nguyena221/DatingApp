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

export default function AddFoodieSpotScreen({ navigation }) {
    const { user } = useUser();
    
    // Form state for new foodie spot
    const [newSpot, setNewSpot] = useState({
        title: '', // Changed from 'name' to match movies pattern
        cuisine: 'Italian',
        location: '',
        priceRange: '$',
        rating: 0,
        emoji: '🍽️',
        category: 'casual',
        review: '',
        signature: '',
        visited: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
    });

    const cuisineOptions = [
        'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 'French',
        'American', 'Mediterranean', 'Korean', 'Vietnamese', 'Greek', 'Spanish',
        'Middle Eastern', 'BBQ', 'Pizza', 'Burgers', 'Seafood', 'Steakhouse',
        'Vegetarian', 'Vegan', 'Fine Dining', 'Fast Food', 'Cafe', 'Bakery',
        'Dessert', 'Ice Cream', 'Bar', 'Brewery', 'Other'
    ];

    const priceRangeOptions = ['$', '$$', '$$$', '$$$$'];

    const categoryOptions = [
        'casual', 'fine-dining', 'fast-food', 'street-food', 'trendy', 
        'iconic', 'hidden-gem', 'family', 'date-night', 'takeout'
    ];

    const emojiOptions = [
        '🍽️', '🍕', '🍔', '🌮', '🍜', '🍝', '🍣', '🥘', '🍖', '🥗',
        '🍰', '🍷', '☕', '🍺', '🥐', '🧀', '🍤', '🥟', '🍛', '🌶️',
        '🔥', '⭐', '💎', '🏆', '❤️'
    ];

    const handleSave = async () => {
        console.log('💾 handleSave called');
        console.log('💾 Current newSpot state:', newSpot);
        
        if (!newSpot.title.trim() || !newSpot.location.trim()) {
            console.log('❌ Validation failed - missing required fields');
            Alert.alert('Error', 'Please fill in at least the spot name and location');
            return;
        }

        try {
            console.log('💾 Starting database save...');
            const userEmail = user?.email || "test2@example.com";
            console.log('💾 Using email:', userEmail);
            
            const result = await addWidgetItem(userEmail, 'foodie', newSpot);
            console.log('💾 Database result:', result);
            
            if (result.success) {
                console.log('✅ Foodie spot added successfully');
                Alert.alert('Success', 'Foodie spot added successfully!', [
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
                Alert.alert('Error', result.message || 'Failed to add foodie spot');
            }
        } catch (error) {
            console.error("❌ Error adding foodie spot:", error);
            Alert.alert('Error', 'Failed to add foodie spot');
        }
    };

    const handleCancel = () => {
        console.log('🔴 Cancel button pressed');
        navigation.goBack();
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

    return (
        <View style={styles.fullContainer}>
            <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient
                    colors={['#e74c3c', '#f39c12']}
                    style={styles.container}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Header with Save Button */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add New Spot</Text>
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
                                <Text style={styles.formLabel}>Restaurant/Spot Name *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newSpot.title}
                                    onChangeText={(text) => {
                                        console.log('📝 Title changed to:', text);
                                        setNewSpot(prev => ({ ...prev, title: text }));
                                    }}
                                    placeholder="Enter restaurant name"
                                    returnKeyType="next"
                                    autoCapitalize="words"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Location *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newSpot.location}
                                    onChangeText={(text) => {
                                        console.log('📝 Location changed to:', text);
                                        setNewSpot(prev => ({ ...prev, location: text }));
                                    }}
                                    placeholder="City, State or Full Address"
                                    returnKeyType="next"
                                    autoCapitalize="words"
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
                                                setNewSpot(prev => ({ ...prev, rating: i + 1 }));
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.star}>
                                                {i < newSpot.rating ? '★' : '☆'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Cuisine</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.optionSelector}>
                                        {cuisineOptions.map(cuisine => (
                                            <TouchableOpacity
                                                key={cuisine}
                                                style={[
                                                    styles.option,
                                                    newSpot.cuisine === cuisine && styles.selectedOption
                                                ]}
                                                onPress={() => {
                                                    console.log('📝 Cuisine changed to:', cuisine);
                                                    setNewSpot(prev => ({ ...prev, cuisine }));
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.optionText,
                                                    newSpot.cuisine === cuisine && styles.selectedOptionText
                                                ]}>
                                                    {cuisine}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Price Range</Text>
                                <View style={styles.priceRangeSelector}>
                                    {priceRangeOptions.map(price => (
                                        <TouchableOpacity
                                            key={price}
                                            style={[
                                                styles.priceOption,
                                                { backgroundColor: getPriceColor(price) },
                                                newSpot.priceRange === price && styles.selectedPriceOption
                                            ]}
                                            onPress={() => {
                                                console.log('📝 Price range changed to:', price);
                                                setNewSpot(prev => ({ ...prev, priceRange: price }));
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[
                                                styles.priceOptionText,
                                                newSpot.priceRange === price && styles.selectedPriceOptionText
                                            ]}>
                                                {price}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Category</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.optionSelector}>
                                        {categoryOptions.map(category => (
                                            <TouchableOpacity
                                                key={category}
                                                style={[
                                                    styles.option,
                                                    newSpot.category === category && styles.selectedOption
                                                ]}
                                                onPress={() => {
                                                    console.log('📝 Category changed to:', category);
                                                    setNewSpot(prev => ({ ...prev, category }));
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.optionText,
                                                    newSpot.category === category && styles.selectedOptionText
                                                ]}>
                                                    {category}
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
                                                    newSpot.emoji === emoji && styles.selectedEmojiOption
                                                ]}
                                                onPress={() => {
                                                    console.log('📝 Emoji changed to:', emoji);
                                                    setNewSpot(prev => ({ ...prev, emoji }));
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
                                <Text style={styles.formLabel}>Signature Dish</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newSpot.signature}
                                    onChangeText={(text) => {
                                        console.log('📝 Signature changed to:', text);
                                        setNewSpot(prev => ({ ...prev, signature: text }));
                                    }}
                                    placeholder="What's their best dish?"
                                    returnKeyType="next"
                                    autoCapitalize="words"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Review/Notes</Text>
                                <TextInput
                                    style={[styles.formInput, styles.reviewInput]}
                                    value={newSpot.review}
                                    onChangeText={(text) => {
                                        console.log('📝 Review changed to:', text);
                                        setNewSpot(prev => ({ ...prev, review: text }));
                                    }}
                                    placeholder="Share your experience..."
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    returnKeyType="done"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Date Visited</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newSpot.visited}
                                    onChangeText={(text) => {
                                        console.log('📝 Visited date changed to:', text);
                                        setNewSpot(prev => ({ ...prev, visited: text }));
                                    }}
                                    placeholder="YYYY-MM-DD"
                                    returnKeyType="done"
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
        backgroundColor: '#e74c3c' 
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
    
    // Option selectors (cuisine, category)
    optionSelector: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 8,
    },
    option: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    selectedOption: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'white',
    },
    optionText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '500',
    },
    selectedOptionText: {
        color: '#333',
        fontWeight: '600',
    },

    // Price range selector
    priceRangeSelector: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
        paddingVertical: 8,
    },
    priceOption: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        minWidth: 60,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedPriceOption: {
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    priceOptionText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },
    selectedPriceOptionText: {
        fontWeight: 'bold',
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