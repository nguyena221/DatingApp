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
    Alert
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

const HobbiesSkillsWidget = ({ navigation, userData, viewOnly = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hobbiesSkills, setHobbiesSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    // Load hobbies & skills from database when component mounts or regains focus
    useFocusEffect(
        useCallback(() => {
            loadHobbiesFromDatabase();
        }, [userData, viewOnly])
    );

    const loadHobbiesFromDatabase = async () => {
        try {
            setLoading(true);
            
            if (viewOnly && userData) {
                // For viewing other users, use the data passed in userData
                const skillsData = userData.widgetData?.hobbies?.skills || [];
                setHobbiesSkills(skillsData);
            } else {
                // For own profile, fetch from database as usual
                const userEmail = user?.email;
                if (!userEmail) {
                    console.log("No user logged in");
                    setHobbiesSkills([]);
                    setLoading(false);
                    return;
                }
                
                const result = await getUserWidgetData(userEmail, 'hobbies');
                
                if (result.success && result.data) {
                    setHobbiesSkills(result.data.skills || []);
                } else {
                    console.log("No hobbies & skills data found, starting with empty array");
                    setHobbiesSkills([]);
                }
            }
        } catch (error) {
            console.error("Error loading hobbies & skills:", error);
            setHobbiesSkills([]);
        } finally {
            setLoading(false);
        }
    };

    const masteredSkills = hobbiesSkills.filter(h => h.level === 'expert');
    const activeHobbies = hobbiesSkills.filter(h => h.type === 'hobby');
    const uniqueCategories = [...new Set(hobbiesSkills.map(h => h.category))];

    const openExpanded = () => {
        setIsExpanded(true);
    };

    const closeExpanded = () => {
        setIsExpanded(false);
    };

    // Navigate to AddHobbySkill screen (only for own profile)
    const handleAddHobbySkill = () => {
        if (viewOnly) return; // Don't allow adding for other users
        
        console.log('🎨 Navigating to AddHobbySkill screen');
        console.log('🎨 Navigation object:', navigation);
        
        // Close the expanded modal first
        setIsExpanded(false);
        
        // Then navigate after a small delay to ensure modal is closed
        setTimeout(() => {
            if (navigation && navigation.navigate) {
                navigation.navigate('AddHobbySkill');
            } else {
                console.error('❌ Navigation not available');
                Alert.alert('Error', 'Navigation not available. Please try again.');
            }
        }, 300);
    };

    const handleRemoveHobbySkill = async (itemId) => {
        if (viewOnly) return; // Don't allow removing for other users
        
        console.log('🗑️ handleRemoveHobbySkill called with itemId:', itemId);
        
        Alert.alert(
            'Remove Hobby/Skill',
            'Are you sure you want to remove this from your collection?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🗑️ User confirmed deletion');
                            const userEmail = user?.email;
                            if (!userEmail) {
                                Alert.alert('Error', 'User not logged in');
                                return;
                            }
                            
                            console.log('🗑️ Removing hobby/skill from database for user:', userEmail);
                            
                            const result = await removeWidgetItem(userEmail, 'hobbies', itemId);
                            console.log('🗑️ Database result:', result);
                            
                            if (result.success) {
                                console.log('✅ Hobby/skill removed from database, updating local state');
                                setHobbiesSkills(prevItems => {
                                    const updatedItems = prevItems.filter(item => item.id !== itemId);
                                    console.log('✅ Updated items array:', updatedItems);
                                    return updatedItems;
                                });
                                Alert.alert('Success', 'Removed successfully!');
                            } else {
                                console.log('❌ Database removal failed:', result.message);
                                Alert.alert('Error', result.message || 'Failed to remove item');
                            }
                        } catch (error) {
                            console.error("❌ Error removing hobby/skill:", error);
                            Alert.alert('Error', 'Failed to remove item');
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateLevel = async (itemId, newLevel) => {
        if (viewOnly) return; // Don't allow editing for other users
        
        try {
            const userEmail = user?.email;
            if (!userEmail) {
                Alert.alert('Error', 'User not logged in');
                return;
            }
            
            const result = await updateWidgetItem(userEmail, 'hobbies', itemId, { level: newLevel });
            
            if (result.success) {
                setHobbiesSkills(prevItems => 
                    prevItems.map(item => 
                        item.id === itemId ? { ...item, level: newLevel } : item
                    )
                );
            } else {
                Alert.alert('Error', result.message || 'Failed to update level');
            }
        } catch (error) {
            console.error("Error updating level:", error);
            Alert.alert('Error', 'Failed to update level');
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'beginner': return '#4CAF50';
            case 'intermediate': return '#FF9800';
            case 'advanced': return '#9C27B0';
            case 'expert': return '#F44336';
            default: return '#666';
        }
    };

    const getLevelText = (level) => {
        switch (level) {
            case 'beginner': return 'Beginner';
            case 'intermediate': return 'Intermediate';
            case 'advanced': return 'Advanced';
            case 'expert': return 'Expert';
            default: return '';
        }
    };

    const getCategoryEmoji = (category) => {
        switch (category) {
            case 'creative': return '🎨';
            case 'music': return '🎵';
            case 'sports': return '⚽';
            case 'tech': return '💻';
            case 'cooking': return '👨‍🍳';
            case 'crafts': return '✂️';
            case 'writing': return '✍️';
            case 'language': return '🗣️';
            case 'outdoor': return '🏔️';
            case 'gaming': return '🎮';
            case 'photography': return '📸';
            case 'dance': return '💃';
            default: return '🌟';
        }
    };

    const getTypeEmoji = (type) => {
        return type === 'hobby' ? '🎯' : '⚡';
    };

    // Get the title based on viewOnly mode
    const getTitle = () => {
        if (viewOnly && userData) {
            const name = userData.firstName || 'User';
            return `🎨 Hobbies / Skills`;
        }
        return '🎨 Hobbies & Skills';
    };

    const getExpandedTitle = () => {
        if (viewOnly && userData) {
            const name = userData.firstName || 'User';
            return `🎨 ${name}'s Creative Journey`;
        }
        return '🎨 My Creative Journey';
    };

    const renderLevelIndicator = (level, interactive = false, itemId = null) => {
        // Disable interactivity if in viewOnly mode
        const isInteractive = interactive && !viewOnly;
        
        const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
        return (
            <View style={styles.levelIndicator}>
                {levels.map((lvl, index) => (
                    <TouchableOpacity
                        key={lvl}
                        disabled={!isInteractive}
                        onPress={isInteractive ? () => handleUpdateLevel(itemId, lvl) : undefined}
                        activeOpacity={isInteractive ? 0.7 : 1}
                        style={[
                            styles.levelDot,
                            { 
                                backgroundColor: index <= levels.indexOf(level) ? getLevelColor(level) : 'rgba(255, 255, 255, 0.3)',
                                borderWidth: isInteractive ? 1 : 0,
                                borderColor: 'rgba(255, 255, 255, 0.5)'
                            }
                        ]}
                    />
                ))}
            </View>
        );
    };

    // Compact Widget View
    const CompactWidget = () => (
        <TouchableOpacity onPress={openExpanded} style={styles.widgetContainer} activeOpacity={0.8}>
            <LinearGradient
                colors={['#8360c3', '#2ebf91']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>{getTitle()}</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.stat}>{masteredSkills.length} expert</Text>
                        <Text style={styles.stat}>{uniqueCategories.length} areas</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading hobbies...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                        {hobbiesSkills.slice(0, 3).map((item) => (
                            <View key={item.id} style={styles.hobbyItem}>
                                <View style={styles.hobbyLeft}>
                                    <Text style={styles.hobbyEmoji}>{getCategoryEmoji(item.category)}</Text>
                                    <View style={styles.hobbyInfo}>
                                        <Text style={styles.hobbyTitle} numberOfLines={1}>{item.title}</Text>
                                        <Text style={styles.hobbyMeta}>{item.category} • {getLevelText(item.level)}</Text>
                                    </View>
                                </View>
                                <View style={styles.compactRightSection}>
                                    <Text style={styles.typeEmoji}>{getTypeEmoji(item.type)}</Text>
                                    {renderLevelIndicator(item.level)}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.expandHint}>
                    <Text style={styles.expandHintText}>Tap to see all {hobbiesSkills.length} hobbies & skills</Text>
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
            <StatusBar barStyle="light-content" backgroundColor="#8360c3" />
            <LinearGradient
                colors={['#8360c3', '#2ebf91']}
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
                        <Text style={styles.expandedTitle}>{getExpandedTitle()}</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Stats */}
                    <View style={styles.expandedStatsContainer}>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{masteredSkills.length}</Text>
                            <Text style={styles.expandedStatLabel}>Expert Level</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{activeHobbies.length}</Text>
                            <Text style={styles.expandedStatLabel}>Hobbies</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{uniqueCategories.length}</Text>
                            <Text style={styles.expandedStatLabel}>Categories</Text>
                        </View>
                    </View>

                    {/* Category Tags */}
                    {uniqueCategories.length > 0 && (
                        <View style={styles.categoryContainer}>
                            <Text style={styles.categoryTitle}>Areas of Interest:</Text>
                            <View style={styles.categoryTags}>
                                {uniqueCategories.map((category, index) => (
                                    <View key={index} style={styles.categoryTag}>
                                        <Text style={styles.categoryEmoji}>{getCategoryEmoji(category)}</Text>
                                        <Text style={styles.categoryText}>{category}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Hobbies & Skills List */}
                    <ScrollView 
                        style={styles.expandedItemsList} 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {hobbiesSkills.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>
                                    {viewOnly ? 'No hobbies or skills yet!' : 'No hobbies or skills yet!'}
                                </Text>
                                <Text style={styles.emptyStateSubtext}>
                                    {viewOnly 
                                        ? 'This user hasn\'t added any hobbies or skills yet' 
                                        : 'Add your first hobby or skill to get started'
                                    }
                                </Text>
                            </View>
                        ) : (
                            hobbiesSkills.map((item) => (
                                <View key={item.id} style={styles.swipeableContainer}>
                                    <TouchableOpacity 
                                        style={styles.expandedHobbyItem}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.expandedHobbyHeader}>
                                            <View style={styles.hobbyLeft}>
                                                <Text style={styles.expandedHobbyEmoji}>{getCategoryEmoji(item.category)}</Text>
                                                <View style={styles.hobbyInfo}>
                                                    <Text style={styles.expandedHobbyTitle}>{item.title}</Text>
                                                    <Text style={styles.expandedHobbyMeta}>{item.category} • {item.type}</Text>
                                                    <View style={styles.expandedHobbyLevel}>
                                                        <Text style={styles.levelLabel}>Level: {getLevelText(item.level)}</Text>
                                                        {renderLevelIndicator(item.level, true, item.id)}
                                                    </View>
                                                </View>
                                            </View>
                                            
                                            <View style={styles.hobbyActions}>
                                                <Text style={styles.expandedTypeEmoji}>{getTypeEmoji(item.type)}</Text>
                                                
                                                {/* Only show delete button if not in viewOnly mode */}
                                                {!viewOnly && (
                                                    <TouchableOpacity
                                                        style={styles.deleteIconButton}
                                                        onPress={() => {
                                                            console.log('🗑️ Delete button pressed for item:', item.id, item.title);
                                                            handleRemoveHobbySkill(item.id);
                                                        }}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={styles.deleteIconText}>🗑️</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                        
                                        {item.description && (
                                            <Text style={styles.hobbyDescription}>"{item.description}"</Text>
                                        )}
                                        
                                        {item.yearsExperience && (
                                            <View style={styles.experienceContainer}>
                                                <Text style={styles.experienceText}>{item.yearsExperience} years experience</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {/* Add Button - Only show if not in viewOnly mode */}
                    {!viewOnly && (
                        <TouchableOpacity 
                            style={styles.expandedAddButton}
                            onPress={handleAddHobbySkill}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.expandedAddButtonText}>+ Add New Hobby/Skill</Text>
                        </TouchableOpacity>
                    )}
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
    itemsList: {
        flex: 1,
    },
    hobbyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        padding: 8,
        marginBottom: 6,
    },
    hobbyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    hobbyEmoji: {
        fontSize: 16,
        marginRight: 8,
    },
    hobbyInfo: {
        flex: 1,
    },
    hobbyTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    hobbyMeta: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    compactRightSection: {
        alignItems: 'center',
    },
    typeEmoji: {
        fontSize: 12,
        marginBottom: 4,
    },
    levelIndicator: {
        flexDirection: 'row',
        gap: 2,
    },
    levelDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
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
    categoryContainer: {
        marginBottom: 20,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
    },
    categoryTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    categoryEmoji: {
        fontSize: 14,
    },
    categoryText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    expandedItemsList: {
        flex: 1,
    },
    swipeableContainer: {
        marginBottom: 12,
    },
    expandedHobbyItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
    },
    expandedHobbyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    hobbyActions: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
    },
    expandedHobbyEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    expandedHobbyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    expandedHobbyMeta: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 8,
        textTransform: 'capitalize',
    },
    expandedHobbyLevel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    levelLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    expandedTypeEmoji: {
        fontSize: 20,
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
    hobbyDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontStyle: 'italic',
        lineHeight: 20,
        marginBottom: 8,
    },
    experienceContainer: {
        alignItems: 'flex-end',
    },
    experienceText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.6)',
        fontStyle: 'italic',
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
});

export default HobbiesSkillsWidget;