import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

export default function EditProfileScreen({ navigation, selectedColor = '#e3f2fd', onColorChange }) {
    const [photoUrl, setPhotoUrl] = useState('');
    const [currentBgColor, setCurrentBgColor] = useState(selectedColor);

    const colorOptions = [
        { name: 'Light Blue', color: '#e3f2fd', id: 1 },
        { name: 'Lavender', color: '#f3e5f5', id: 2 },
        { name: 'Light Green', color: '#e8f5e8', id: 3 },
        { name: 'Peach', color: '#ffeaa7', id: 4 },
        { name: 'Light Pink', color: '#ffedef', id: 5 },
        { name: 'Light Orange', color: '#ffe4cc', id: 6 },
        { name: 'Mint', color: '#d1f2eb', id: 7 },
        { name: 'Light Yellow', color: '#fff9c4', id: 8 },
    ];

    const getProfilePhoto = async () => {
        const response = await fetch("https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face");
        return response.url;
    };

    useEffect(() => {
        const loadPhoto = async () => {
            const url = await getProfilePhoto();
            setPhotoUrl(url);
        };
        loadPhoto();
    }, []);

    const handleColorChange = async (color) => {
        setCurrentBgColor(color);
        try {
            await AsyncStorage.setItem('profileBackgroundColor', color);
            if (onColorChange) {
                onColorChange(color);
            }
        } catch (e) {
            console.error('[ERROR] Failed to save color to AsyncStorage', e);
        }
    };

    const handlePhotoEdit = () => {
        // Placeholder for photo editing functionality
    };

    const handleSave = () => {
        if (navigation) {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.fullContainer}>
            <StatusBar backgroundColor={currentBgColor} barStyle="dark-content" />
            <SafeAreaView style={[styles.safeArea, { backgroundColor: currentBgColor }]}>
                <LinearGradient
                    colors={[currentBgColor, '#ffffff']}
                    style={styles.container}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                >
                    {/* Header with Save Button */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Photo Section with Edit Icon */}
                    <View style={styles.photoContainer}>
                        <View style={styles.photoFrame}>
                            {photoUrl ? (
                                <Image source={{ uri: photoUrl }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <View style={styles.loadingText}>
                                    <Text>Loading...</Text>
                                </View>
                            )}
                            <TouchableOpacity style={styles.editPhotoIcon} onPress={handlePhotoEdit}>
                                <Text style={styles.editPhotoIconText}>✎</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Profile Info */}
                    <View style={styles.profileInfoContainer}>
                        <View style={styles.profileInfoNameContainer}>
                            <TouchableOpacity style={styles.editableField}>
                                <Text style={styles.nameText}>Sarah Johnson</Text>
                                <Text style={styles.editHint}>Tap to edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.editableField}>
                                <Text style={styles.ageText}>24</Text>
                                <Text style={styles.editHint}>Tap to edit</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Background Color Picker */}
                        <View style={styles.colorPickerContainer}>
                            <Text style={styles.colorPickerTitle}>Choose Background Color</Text>
                            <View style={styles.colorOptionsContainer}>
                                {colorOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.colorOption,
                                            { backgroundColor: option.color },
                                            currentBgColor === option.color && styles.selectedColorOption
                                        ]}
                                        onPress={() => handleColorChange(option.color)}
                                    >
                                        {currentBgColor === option.color && (
                                            <Text style={styles.selectedIcon}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Stats Container - Editable */}
                        <View style={styles.statsContainer}>
                            <Text style={styles.statsTitle}>Personality Stats</Text>

                            <TouchableOpacity style={styles.editableStatRow}>
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    style={styles.statRow}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.statLabel}>Personality</Text>
                                    <View style={styles.statValueContainer}>
                                        <Text style={styles.statValue}>Extrovert</Text>
                                        <Text style={styles.editIcon}>✎</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.editableStatRow}>
                                <LinearGradient
                                    colors={['#ffecd2', '#fcb69f']}
                                    style={styles.statRow}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.statLabelDark}>Candy Choice</Text>
                                    <View style={styles.statValueContainer}>
                                        <Text style={styles.statValueDark}>Skittles 🌈</Text>
                                        <Text style={styles.editIconDark}>✎</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.editableStatRow}>
                                <LinearGradient
                                    colors={['#a8edea', '#fed6e3']}
                                    style={styles.statRow}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.statLabelDark}>Morning Person</Text>
                                    <View style={styles.statValueContainer}>
                                        <Text style={styles.statValueDark}>Night Owl 🦉</Text>
                                        <Text style={styles.editIconDark}>✎</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.editableStatRow}>
                                <LinearGradient
                                    colors={['#d299c2', '#fef9d7']}
                                    style={styles.statRow}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.statLabelDark}>Social Style</Text>
                                    <View style={styles.statValueContainer}>
                                        <Text style={styles.statValueDark}>Party Starter</Text>
                                        <Text style={styles.editIconDark}>✎</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: '#e3f2fd' },
    container: { flex: 1 },
    safeArea: { flex: 1 },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    cancelButton: { padding: 8 },
    cancelText: { fontSize: 16, color: '#666', fontWeight: '500' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    saveButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    saveText: { fontSize: 16, color: 'white', fontWeight: '600' },
    photoContainer: { height: 200, width: '100%', alignItems: 'center', paddingTop: 20 },
    photoFrame: {
        width: 170,
        height: 170,
        borderRadius: 100,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#ddd',
        position: 'relative',
    },
    editPhotoIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.7)',
        width: 35,
        height: 35,
        borderRadius: 17.5,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    editPhotoIconText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    loadingText: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    profileInfoContainer: { flex: 1, marginTop: 23 },
    profileInfoNameContainer: { alignItems: 'center', marginBottom: 20 },
    editableField: { alignItems: 'center', padding: 8, borderRadius: 8, marginBottom: 10 },
    nameText: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 2 },
    ageText: { fontSize: 18, color: '#666', marginBottom: 2 },
    editHint: { fontSize: 12, color: '#999', fontStyle: 'italic' },
    colorPickerContainer: { paddingHorizontal: 20, marginBottom: 30 },
    colorPickerTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 15, textAlign: 'center' },
    colorOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    colorOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedColorOption: { borderColor: '#007AFF', borderWidth: 3 },
    selectedIcon: { color: '#333', fontSize: 20, fontWeight: 'bold' },
    statsContainer: { paddingHorizontal: 20 },
    statsTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 15, textAlign: 'center' },
    editableStatRow: { marginBottom: 12 },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    statLabel: { fontSize: 14, fontWeight: '600', color: 'white' },
    statValue: { fontSize: 14, fontWeight: '500', color: 'white' },
    statLabelDark: { fontSize: 14, fontWeight: '600', color: '#333' },
    statValueDark: { fontSize: 14, fontWeight: '500', color: '#333' },
    statValueContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    editIcon: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
    editIconDark: { fontSize: 12, color: 'rgba(0,0,0,0.6)' },
});
