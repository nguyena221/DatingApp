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

export default function AddHobbySkillScreen({ navigation }) {
    const { user } = useUser();
    
    // Form state for new hobby/skill
    const [newItem, setNewItem] = useState({
        title: '',
        type: 'hobby',
        category: 'creative',
        level: 'beginner',
        description: '',
        yearsExperience: ''
    });

    const typeOptions = [
        { value: 'hobby', label: 'Hobby', emoji: '🎯', description: 'Something you do for fun' },
        { value: 'skill', label: 'Skill', emoji: '⚡', description: 'Something you\'re good at' }
    ];

    const categoryOptions = [
        { value: 'creative', label: 'Creative Arts', emoji: '🎨' },
        { value: 'music', label: 'Music', emoji: '🎵' },
        { value: 'sports', label: 'Sports & Fitness', emoji: '⚽' },
        { value: 'tech', label: 'Technology', emoji: '💻' },
        { value: 'cooking', label: 'Cooking & Baking', emoji: '👨‍🍳' },
        { value: 'crafts', label: 'Crafts & DIY', emoji: '✂️' },
        { value: 'writing', label: 'Writing', emoji: '✍️' },
        { value: 'language', label: 'Languages', emoji: '🗣️' },
        { value: 'outdoor', label: 'Outdoor Activities', emoji: '🏔️' },
        { value: 'gaming', label: 'Gaming', emoji: '🎮' },
        { value: 'photography', label: 'Photography', emoji: '📸' },
        { value: 'dance', label: 'Dance', emoji: '💃' },
        { value: 'other', label: 'Other', emoji: '🌟' }
    ];

    const levelOptions = [
        { value: 'beginner', label: 'Beginner', color: '#4CAF50', description: 'Just starting out' },
        { value: 'intermediate', label: 'Intermediate', color: '#FF9800', description: 'Getting the hang of it' },
        { value: 'advanced', label: 'Advanced', color: '#9C27B0', description: 'Pretty skilled' },
        { value: 'expert', label: 'Expert', color: '#F44336', description: 'Master level' }
    ];

    const handleSave = async () => {
        console.log('💾 handleSave called');
        console.log('💾 Current newItem state:', newItem);
        
        if (!newItem.title.trim()) {
            console.log('❌ Validation failed - missing title');
            Alert.alert('Error', 'Please fill in at least the title');
            return;
        }

        try {
            console.log('💾 Starting database save...');
            const userEmail = user?.email;
            if (!userEmail) {
                Alert.alert('Error', 'User not logged in');
                return;
            }
            
            console.log('💾 Using email:', userEmail);
            
            const result = await addWidgetItem(userEmail, 'hobbies', newItem);
            console.log('💾 Database result:', result);
            
            if (result.success) {
                console.log('✅ Hobby/skill added successfully');
                Alert.alert('Success', 'Hobby/skill added successfully!', [
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
                Alert.alert('Error', result.message || 'Failed to add hobby/skill');
            }
        } catch (error) {
            console.error("❌ Error adding hobby/skill:", error);
            Alert.alert('Error', 'Failed to add hobby/skill');
        }
    };

    const handleCancel = () => {
        console.log('🔴 Cancel button pressed');
        navigation.goBack();
    };

    const renderLevelSelector = () => {
        return (
            <View style={styles.levelGrid}>
                {levelOptions.map(level => (
                    <TouchableOpacity
                        key={level.value}
                        style={[
                            styles.levelOption,
                            { borderColor: level.color },
                            newItem.level === level.value && { backgroundColor: level.color }
                        ]}
                        onPress={() => {
                            console.log('📝 Level changed to:', level.value);
                            setNewItem(prev => ({ ...prev, level: level.value }));
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.levelOptionText,
                            newItem.level === level.value && styles.selectedLevelText
                        ]}>
                            {level.label}
                        </Text>
                        <Text style={[
                            styles.levelDescription,
                            newItem.level === level.value && styles.selectedLevelDescription
                        ]}>
                            {level.description}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.fullContainer}>
            <StatusBar backgroundColor="#8360c3" barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient
                    colors={['#8360c3', '#2ebf91']}
                    style={styles.container}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Header with Save Button */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add Hobby/Skill</Text>
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
                                    value={newItem.title}
                                    onChangeText={(text) => {
                                        console.log('📝 Title changed to:', text);
                                        setNewItem(prev => ({ ...prev, title: text }));
                                    }}
                                    placeholder="e.g., Guitar Playing, Digital Photography"
                                    returnKeyType="next"
                                    autoCapitalize="words"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Type</Text>
                                <View style={styles.typeSelector}>
                                    {typeOptions.map(type => (
                                        <TouchableOpacity
                                            key={type.value}
                                            style={[
                                                styles.typeOption,
                                                newItem.type === type.value && styles.selectedTypeOption
                                            ]}
                                            onPress={() => {
                                                console.log('📝 Type changed to:', type.value);
                                                setNewItem(prev => ({ ...prev, type: type.value }));
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.typeEmoji}>{type.emoji}</Text>
                                            <Text style={[
                                                styles.typeOptionText,
                                                newItem.type === type.value && styles.selectedTypeOptionText
                                            ]}>
                                                {type.label}
                                            </Text>
                                            <Text style={[
                                                styles.typeDescription,
                                                newItem.type === type.value && styles.selectedTypeDescription
                                            ]}>
                                                {type.description}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Category</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.categorySelector}>
                                        {categoryOptions.map(category => (
                                            <TouchableOpacity
                                                key={category.value}
                                                style={[
                                                    styles.categoryOption,
                                                    newItem.category === category.value && styles.selectedCategoryOption
                                                ]}
                                                onPress={() => {
                                                    console.log('📝 Category changed to:', category.value);
                                                    setNewItem(prev => ({ ...prev, category: category.value }));
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                                                <Text style={[
                                                    styles.categoryOptionText,
                                                    newItem.category === category.value && styles.selectedCategoryOptionText
                                                ]}>
                                                    {category.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Skill Level</Text>
                                {renderLevelSelector()}
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Years of Experience (Optional)</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newItem.yearsExperience}
                                    onChangeText={(text) => {
                                        console.log('📝 Years experience changed to:', text);
                                        setNewItem(prev => ({ ...prev, yearsExperience: text }));
                                    }}
                                    placeholder="e.g., 2, 5, 10+"
                                    keyboardType="numeric"
                                    returnKeyType="next"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Description/Notes</Text>
                                <TextInput
                                    style={[styles.formInput, styles.descriptionInput]}
                                    value={newItem.description}
                                    onChangeText={(text) => {
                                        console.log('📝 Description changed to:', text);
                                        setNewItem(prev => ({ ...prev, description: text }));
                                    }}
                                    placeholder="Tell us more about this hobby or skill..."
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
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
        backgroundColor: '#8360c3' 
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
    descriptionInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    
    // Type selector
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    typeOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    selectedTypeOption: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'white',
    },
    typeEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    typeOptionText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
        marginBottom: 4,
    },
    selectedTypeOptionText: {
        color: '#333',
        fontWeight: '700',
    },
    typeDescription: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    selectedTypeDescription: {
        color: '#666',
    },
    
    // Category selector
    categorySelector: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 8,
    },
    categoryOption: {
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        minWidth: 90,
    },
    selectedCategoryOption: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'white',
    },
    categoryEmoji: {
        fontSize: 20,
        marginBottom: 4,
    },
    categoryOptionText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '500',
        textAlign: 'center',
    },
    selectedCategoryOptionText: {
        color: '#333',
        fontWeight: '600',
    },
    
    // Level selector
    levelGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    levelOption: {
        width: '48%',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2,
        alignItems: 'center',
    },
    levelOptionText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
        marginBottom: 4,
    },
    selectedLevelText: {
        color: 'white',
        fontWeight: '700',
    },
    levelDescription: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    selectedLevelDescription: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
});