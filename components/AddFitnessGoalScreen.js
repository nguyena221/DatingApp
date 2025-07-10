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

export default function AddFitnessGoalScreen({ navigation }) {
    const { user } = useUser();
    
    // Form state for new fitness goal
    const [newGoal, setNewGoal] = useState({
        title: '',
        target: '',
        category: 'strength',
        progress: 0,
        status: 'active',
        description: '',
        deadline: ''
    });

    const categoryOptions = [
        { value: 'strength', label: 'Strength Training', emoji: '🏋️' },
        { value: 'cardio', label: 'Cardio', emoji: '🏃' },
        { value: 'flexibility', label: 'Flexibility', emoji: '🧘' },
        { value: 'weight-loss', label: 'Weight Loss', emoji: '⚖️' },
        { value: 'muscle-gain', label: 'Muscle Gain', emoji: '💪' },
        { value: 'endurance', label: 'Endurance', emoji: '🚴' },
        { value: 'sports', label: 'Sports', emoji: '⚽' },
        { value: 'general', label: 'General Fitness', emoji: '🎯' }
    ];

    const statusOptions = [
        { value: 'active', label: 'Active', color: '#FF9800' },
        { value: 'paused', label: 'Paused', color: '#9E9E9E' },
        { value: 'completed', label: 'Completed', color: '#4CAF50' }
    ];

    const progressOptions = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    const handleSave = async () => {
        console.log('💾 handleSave called');
        console.log('💾 Current newGoal state:', newGoal);
        
        if (!newGoal.title.trim() || !newGoal.target.trim()) {
            console.log('❌ Validation failed - missing required fields');
            Alert.alert('Error', 'Please fill in at least the goal title and target');
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
            
            const result = await addWidgetItem(userEmail, 'fitness', newGoal);
            console.log('💾 Database result:', result);
            
            if (result.success) {
                console.log('✅ Fitness goal added successfully');
                Alert.alert('Success', 'Fitness goal added successfully!', [
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
                Alert.alert('Error', result.message || 'Failed to add fitness goal');
            }
        } catch (error) {
            console.error("❌ Error adding fitness goal:", error);
            Alert.alert('Error', 'Failed to add fitness goal');
        }
    };

    const handleCancel = () => {
        console.log('🔴 Cancel button pressed');
        navigation.goBack();
    };

    return (
        <View style={styles.fullContainer}>
            <StatusBar backgroundColor="#11998e" barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient
                    colors={['#11998e', '#38ef7d']}
                    style={styles.container}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Header with Save Button */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add Fitness Goal</Text>
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
                                    placeholder="e.g., Run 5K under 30 minutes"
                                    returnKeyType="next"
                                    autoCapitalize="words"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Target *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newGoal.target}
                                    onChangeText={(text) => {
                                        console.log('📝 Target changed to:', text);
                                        setNewGoal(prev => ({ ...prev, target: text }));
                                    }}
                                    placeholder="e.g., 30 minutes, 150 lbs, 3x per week"
                                    returnKeyType="next"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
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
                                <Text style={styles.formLabel}>Status</Text>
                                <View style={styles.statusSelector}>
                                    {statusOptions.map(status => (
                                        <TouchableOpacity
                                            key={status.value}
                                            style={[
                                                styles.statusOption,
                                                { backgroundColor: newGoal.status === status.value ? status.color : 'rgba(255, 255, 255, 0.2)' }
                                            ]}
                                            onPress={() => {
                                                console.log('📝 Status changed to:', status.value);
                                                setNewGoal(prev => ({ ...prev, status: status.value }));
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[
                                                styles.statusOptionText,
                                                { color: newGoal.status === status.value ? 'white' : 'rgba(255, 255, 255, 0.9)' }
                                            ]}>
                                                {status.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Current Progress: {newGoal.progress}%</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.progressSelector}>
                                        {progressOptions.map(progress => (
                                            <TouchableOpacity
                                                key={progress}
                                                style={[
                                                    styles.progressOption,
                                                    newGoal.progress === progress && styles.selectedProgressOption
                                                ]}
                                                onPress={() => {
                                                    console.log('📝 Progress changed to:', progress);
                                                    const updatedGoal = { ...newGoal, progress };
                                                    // Auto-update status if progress is 100%
                                                    if (progress >= 100) {
                                                        updatedGoal.status = 'completed';
                                                    } else if (updatedGoal.status === 'completed') {
                                                        updatedGoal.status = 'active';
                                                    }
                                                    setNewGoal(updatedGoal);
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.progressOptionText,
                                                    newGoal.progress === progress && styles.selectedProgressOptionText
                                                ]}>
                                                    {progress}%
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Deadline (Optional)</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newGoal.deadline}
                                    onChangeText={(text) => {
                                        console.log('📝 Deadline changed to:', text);
                                        setNewGoal(prev => ({ ...prev, deadline: text }));
                                    }}
                                    placeholder="YYYY-MM-DD"
                                    returnKeyType="next"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Description/Notes</Text>
                                <TextInput
                                    style={[styles.formInput, styles.descriptionInput]}
                                    value={newGoal.description}
                                    onChangeText={(text) => {
                                        console.log('📝 Description changed to:', text);
                                        setNewGoal(prev => ({ ...prev, description: text }));
                                    }}
                                    placeholder="Additional details about your goal..."
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
        backgroundColor: '#11998e' 
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
        minWidth: 80,
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
    
    // Progress selector
    progressSelector: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 8,
    },
    progressOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        minWidth: 50,
        alignItems: 'center',
    },
    selectedProgressOption: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'white',
    },
    progressOptionText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '500',
    },
    selectedProgressOptionText: {
        color: '#333',
        fontWeight: '600',
    },
});