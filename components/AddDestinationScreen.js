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

export default function AddDestinationScreen({ navigation }) {
    const { user } = useUser();
    
    // Form state for new destination
    const [newDestination, setNewDestination] = useState({
        name: '',
        country: '',
        emoji: '🏙️',
        visited: false,
        notes: ''
    });

    const emojiOptions = [
        '🏙️', '🏝️', '🏔️', '🏛️', '🗾', '🏖️', '🗽', '🗼', '🏰', '🕌', 
        '⛰️', '🌋', '🏜️', '🌴', '🌺', '🗻', '🏞️', '🎭', '🥖', '🐪'
    ];

    const statusOptions = [
        { value: false, label: 'Want to Visit', color: 'rgba(255, 255, 255, 0.3)', icon: '♡' },
        { value: true, label: 'Already Visited', color: 'rgba(76, 217, 100, 0.9)', icon: '✓' }
    ];

    const handleSave = async () => {
        console.log('💾 handleSave called');
        console.log('💾 Current newDestination state:', newDestination);
        
        if (!newDestination.name.trim() || !newDestination.country.trim()) {
            console.log('❌ Validation failed - missing name or country');
            Alert.alert('Error', 'Please fill in both destination name and country');
            return;
        }

        try {
            console.log('💾 Starting database save...');
            const userEmail = user?.email || "test2@example.com";
            console.log('💾 Using email:', userEmail);
            
            const result = await addWidgetItem(userEmail, 'travel', newDestination);
            console.log('💾 Database result:', result);
            
            if (result.success) {
                console.log('✅ Destination added successfully');
                Alert.alert('Success', 'Destination added successfully!', [
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
                Alert.alert('Error', result.message || 'Failed to add destination');
            }
        } catch (error) {
            console.error("❌ Error adding destination:", error);
            Alert.alert('Error', 'Failed to add destination');
        }
    };

    const handleCancel = () => {
        console.log('🔴 Cancel button pressed');
        navigation.goBack();
    };

    return (
        <View style={styles.fullContainer}>
            <StatusBar backgroundColor="#667eea" barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.container}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Header with Save Button */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add New Destination</Text>
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
                                <Text style={styles.formLabel}>Destination Name *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newDestination.name}
                                    onChangeText={(text) => {
                                        console.log('📝 Name changed to:', text);
                                        setNewDestination(prev => ({ ...prev, name: text }));
                                    }}
                                    placeholder="e.g. Tokyo, Paris, Bali"
                                    returnKeyType="next"
                                    autoCapitalize="words"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Country *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newDestination.country}
                                    onChangeText={(text) => {
                                        console.log('📝 Country changed to:', text);
                                        setNewDestination(prev => ({ ...prev, country: text }));
                                    }}
                                    placeholder="e.g. Japan, France, Indonesia"
                                    returnKeyType="next"
                                    autoCapitalize="words"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Status</Text>
                                <View style={styles.statusSelector}>
                                    {statusOptions.map(status => (
                                        <TouchableOpacity
                                            key={status.value.toString()}
                                            style={[
                                                styles.statusOption,
                                                { backgroundColor: newDestination.visited === status.value ? status.color : 'rgba(255, 255, 255, 0.2)' }
                                            ]}
                                            onPress={() => {
                                                console.log('📝 Status changed to:', status.value);
                                                setNewDestination(prev => ({ ...prev, visited: status.value }));
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.statusIcon}>
                                                {status.icon}
                                            </Text>
                                            <Text style={[
                                                styles.statusOptionText,
                                                { color: newDestination.visited === status.value ? 'white' : 'rgba(255, 255, 255, 0.9)' }
                                            ]}>
                                                {status.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
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
                                                    newDestination.emoji === emoji && styles.selectedEmojiOption
                                                ]}
                                                onPress={() => {
                                                    console.log('📝 Emoji changed to:', emoji);
                                                    setNewDestination(prev => ({ ...prev, emoji }));
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
                                <Text style={styles.formLabel}>Notes</Text>
                                <TextInput
                                    style={[styles.formInput, styles.notesInput]}
                                    value={newDestination.notes}
                                    onChangeText={(text) => {
                                        console.log('📝 Notes changed to:', text);
                                        setNewDestination(prev => ({ ...prev, notes: text }));
                                    }}
                                    placeholder="Why do you want to visit? What did you love about it? Any special memories?"
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
        backgroundColor: '#667eea' 
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
    notesInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    
    // Status selector
    statusSelector: {
        gap: 12,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    statusIcon: {
        fontSize: 18,
        marginRight: 12,
        color: 'white',
    },
    statusOptionText: {
        fontSize: 16,
        fontWeight: '500',
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