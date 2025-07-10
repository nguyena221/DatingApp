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

export default function AddLifeGoalScreen({ navigation }) {
    const { user } = useUser();
    
    // Form state for new life goal
    const [newGoal, setNewGoal] = useState({
        title: '',
        category: 'career',
        timeframe: 'medium',
        status: 'planning',
        description: '',
        targetDate: ''
    });

    const categoryOptions = [
        { value: 'career', label: 'Career & Work', emoji: '💼' },
        { value: 'health', label: 'Health & Wellness', emoji: '🏥' },
        { value: 'relationships', label: 'Relationships', emoji: '❤️' },
        { value: 'education', label: 'Education & Learning', emoji: '🎓' },
        { value: 'financial', label: 'Financial', emoji: '💰' },
        { value: 'travel', label: 'Travel & Adventure', emoji: '✈️' },
        { value: 'personal', label: 'Personal Growth', emoji: '🌱' },
        { value: 'family', label: 'Family & Home', emoji: '👨‍👩‍👧‍👦' },
        { value: 'creative', label: 'Creative Pursuits', emoji: '🎨' },
        { value: 'spiritual', label: 'Spiritual & Mindfulness', emoji: '🙏' },
        { value: 'adventure', label: 'Adventure & Sports', emoji: '🗻' },
        { value: 'giving', label: 'Giving & Impact', emoji: '🤝' }
    ];

    const timeframeOptions = [
        { value: 'short', label: 'Short-term', description: '1 year', color: '#4CAF50' },
        { value: 'medium', label: 'Medium-term', description: '5 years', color: '#FF9800' },
        { value: 'long', label: 'Long-term', description: '10+ years', color: '#9C27B0' },
        { value: 'lifetime', label: 'Lifetime', description: 'No rush', color: '#F44336' }
    ];

    const statusOptions = [
        { value: 'planning', label: 'Planning', color: '#2196F3', description: 'Still figuring it out' },
        { value: 'in-progress', label: 'In Progress', color: '#FF9800', description: 'Actively working on it' },
        { value: 'paused', label: 'Paused', color: '#9E9E9E', description: 'Temporarily on hold' },
        { value: 'achieved', label: 'Achieved', color: '#4CAF50', description: 'Goal accomplished!' }
    ];

    const handleSave = async () => {
        console.log('💾 handleSave called');
        console.log('💾 Current newGoal state:', newGoal);
        
        if (!newGoal.title.trim()) {
            console.log('❌ Validation failed - missing title');
            Alert.alert('Error', 'Please fill in at least the goal title');
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
            
            const result = await addWidgetItem(userEmail, 'lifegoals', newGoal);
            console.log('💾 Database result:', result);
            
            if (result.success) {
                console.log('✅ Life goal added successfully');
                Alert.alert('Success', 'Life goal added successfully!', [
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
                Alert.alert('Error', result.message || 'Failed to add life goal');
            }
        } catch (error) {
            console.error("❌ Error adding life goal:", error);
            Alert.alert('Error', 'Failed to add life goal');
        }
    };

    const handleCancel = () => {
        console.log('🔴 Cancel button pressed');
        navigation.goBack();
    };

    return (
        <View style={styles.fullContainer}>
            <StatusBar backgroundColor="#fa709a" barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient
                    colors={['#fa709a', '#fee140']}
                    style={styles.container}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Header with Save Button */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add Life Goal</Text>
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
                                <Text style={styles.formLabel}>Goal Title *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newGoal.title}
                                    onChangeText={(text) => {
                                        console.log('📝 Title changed to:', text);
                                        setNewGoal(prev => ({ ...prev, title: text }));
                                    }}
                                    placeholder="e.g., Start my own business, Learn Spanish"
                                    returnKeyType="next"
                                    autoCapitalize="words"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Life Area</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.categorySelector}>
                                        {categoryOptions.map(category => (
                                            <TouchableOpacity
                                                key={category.value}
                                                style={[
                                                    styles.categoryOption,
                                                    newGoal.category === category.value && styles.selectedCategoryOption
                                                ]}
                                                onPress={() => {
                                                    console.log('📝 Category changed to:', category.value);
                                                    setNewGoal(prev => ({ ...prev, category: category.value }));
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                                                <Text style={[
                                                    styles.categoryOptionText,
                                                    newGoal.category === category.value && styles.selectedCategoryOptionText
                                                ]}>
                                                    {category.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Timeframe</Text>
                                <View style={styles.timeframeGrid}>
                                    {timeframeOptions.map(timeframe => (
                                        <TouchableOpacity
                                            key={timeframe.value}
                                            style={[
                                                styles.timeframeOption,
                                                { borderColor: timeframe.color },
                                                newGoal.timeframe === timeframe.value && { backgroundColor: timeframe.color }
                                            ]}
                                            onPress={() => {
                                                console.log('📝 Timeframe changed to:', timeframe.value);
                                                setNewGoal(prev => ({ ...prev, timeframe: timeframe.value }));
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[
                                                styles.timeframeLabel,
                                                newGoal.timeframe === timeframe.value && styles.selectedTimeframeText
                                            ]}>
                                                {timeframe.label}
                                            </Text>
                                            <Text style={[
                                                styles.timeframeDescription,
                                                newGoal.timeframe === timeframe.value && styles.selectedTimeframeDescription
                                            ]}>
                                                {timeframe.description}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Current Status</Text>
                                <View style={styles.statusGrid}>
                                    {statusOptions.map(status => (
                                        <TouchableOpacity
                                            key={status.value}
                                            style={[
                                                styles.statusOption,
                                                { borderColor: status.color },
                                                newGoal.status === status.value && { backgroundColor: status.color }
                                            ]}
                                            onPress={() => {
                                                console.log('📝 Status changed to:', status.value);
                                                setNewGoal(prev => ({ ...prev, status: status.value }));
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[
                                                styles.statusLabel,
                                                newGoal.status === status.value && styles.selectedStatusText
                                            ]}>
                                                {status.label}
                                            </Text>
                                            <Text style={[
                                                styles.statusDescription,
                                                newGoal.status === status.value && styles.selectedStatusDescription
                                            ]}>
                                                {status.description}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Target Date (Optional)</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newGoal.targetDate}
                                    onChangeText={(text) => {
                                        console.log('📝 Target date changed to:', text);
                                        setNewGoal(prev => ({ ...prev, targetDate: text }));
                                    }}
                                    placeholder="YYYY-MM-DD"
                                    returnKeyType="next"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Description/Why This Matters</Text>
                                <TextInput
                                    style={[styles.formInput, styles.descriptionInput]}
                                    value={newGoal.description}
                                    onChangeText={(text) => {
                                        console.log('📝 Description changed to:', text);
                                        setNewGoal(prev => ({ ...prev, description: text }));
                                    }}
                                    placeholder="Why is this important to you? What will achieving this goal mean?"
                                    multiline
                                    numberOfLines={4}
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
        backgroundColor: '#fa709a' 
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
        height: 100,
        textAlignVertical: 'top',
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
        minWidth: 100,
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
    
    // Timeframe selector
    timeframeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    timeframeOption: {
        width: '48%',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2,
        alignItems: 'center',
    },
    timeframeLabel: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
        marginBottom: 4,
    },
    selectedTimeframeText: {
        color: 'white',
        fontWeight: '700',
    },
    timeframeDescription: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    selectedTimeframeDescription: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    
    // Status selector
    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusOption: {
        width: '48%',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2,
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
        marginBottom: 4,
    },
    selectedStatusText: {
        color: 'white',
        fontWeight: '700',
    },
    statusDescription: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    selectedStatusDescription: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
});