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

const LifeGoalsWidget = ({ navigation, userData, viewOnly = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [lifeGoals, setLifeGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    // Load life goals from database when component mounts or regains focus
    useFocusEffect(
        useCallback(() => {
            loadGoalsFromDatabase();
        }, [userData, viewOnly])
    );

    const loadGoalsFromDatabase = async () => {
        try {
            setLoading(true);
            
            if (viewOnly && userData) {
                // For viewing other users, use the data passed in userData
                const goalsData = userData.widgetData?.lifegoals?.goals || [];
                setLifeGoals(goalsData);
            } else {
                // For own profile, fetch from database as usual
                const userEmail = user?.email;
                if (!userEmail) {
                    console.log("No user logged in");
                    setLifeGoals([]);
                    setLoading(false);
                    return;
                }
                
                const result = await getUserWidgetData(userEmail, 'lifegoals');
                
                if (result.success && result.data) {
                    setLifeGoals(result.data.goals || []);
                } else {
                    console.log("No life goals data found, starting with empty array");
                    setLifeGoals([]);
                }
            }
        } catch (error) {
            console.error("Error loading life goals:", error);
            setLifeGoals([]);
        } finally {
            setLoading(false);
        }
    };

    const completedGoals = lifeGoals.filter(g => g.status === 'achieved');
    const activeGoals = lifeGoals.filter(g => g.status === 'in-progress');
    const uniqueCategories = [...new Set(lifeGoals.map(g => g.category))];

    const openExpanded = () => {
        setIsExpanded(true);
    };

    const closeExpanded = () => {
        setIsExpanded(false);
    };

    // Navigate to AddLifeGoal screen (only for own profile)
    const handleAddGoal = () => {
        if (viewOnly) return; // Don't allow adding for other users
        
        console.log('🎯 Navigating to AddLifeGoal screen');
        console.log('🎯 Navigation object:', navigation);
        
        // Close the expanded modal first
        setIsExpanded(false);
        
        // Then navigate after a small delay to ensure modal is closed
        setTimeout(() => {
            if (navigation && navigation.navigate) {
                navigation.navigate('AddLifeGoal');
            } else {
                console.error('❌ Navigation not available');
                Alert.alert('Error', 'Navigation not available. Please try again.');
            }
        }, 300);
    };

    const handleRemoveGoal = async (goalId) => {
        if (viewOnly) return; // Don't allow removing for other users
        
        console.log('🗑️ handleRemoveGoal called with goalId:', goalId);
        
        Alert.alert(
            'Remove Goal',
            'Are you sure you want to remove this life goal?',
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
                            
                            console.log('🗑️ Removing goal from database for user:', userEmail);
                            
                            const result = await removeWidgetItem(userEmail, 'lifegoals', goalId);
                            console.log('🗑️ Database result:', result);
                            
                            if (result.success) {
                                console.log('✅ Goal removed from database, updating local state');
                                setLifeGoals(prevGoals => {
                                    const updatedGoals = prevGoals.filter(goal => goal.id !== goalId);
                                    console.log('✅ Updated goals array:', updatedGoals);
                                    return updatedGoals;
                                });
                                Alert.alert('Success', 'Goal removed successfully!');
                            } else {
                                console.log('❌ Database removal failed:', result.message);
                                Alert.alert('Error', result.message || 'Failed to remove goal');
                            }
                        } catch (error) {
                            console.error("❌ Error removing goal:", error);
                            Alert.alert('Error', 'Failed to remove goal');
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateGoalStatus = async (goalId, newStatus) => {
        if (viewOnly) return; // Don't allow editing for other users
        
        try {
            const userEmail = user?.email;
            if (!userEmail) {
                Alert.alert('Error', 'User not logged in');
                return;
            }
            
            const result = await updateWidgetItem(userEmail, 'lifegoals', goalId, { status: newStatus });
            
            if (result.success) {
                setLifeGoals(prevGoals => 
                    prevGoals.map(goal => 
                        goal.id === goalId ? { ...goal, status: newStatus } : goal
                    )
                );
            } else {
                Alert.alert('Error', result.message || 'Failed to update status');
            }
        } catch (error) {
            console.error("Error updating status:", error);
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'achieved': return '#4CAF50';
            case 'in-progress': return '#FF9800';
            case 'planning': return '#2196F3';
            case 'paused': return '#9E9E9E';
            default: return '#666';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'achieved': return 'Achieved';
            case 'in-progress': return 'In Progress';
            case 'planning': return 'Planning';
            case 'paused': return 'Paused';
            default: return '';
        }
    };

    const getCategoryEmoji = (category) => {
        switch (category) {
            case 'career': return '💼';
            case 'health': return '🏥';
            case 'relationships': return '❤️';
            case 'education': return '🎓';
            case 'financial': return '💰';
            case 'travel': return '✈️';
            case 'personal': return '🌱';
            case 'family': return '👨‍👩‍👧‍👦';
            case 'creative': return '🎨';
            case 'spiritual': return '🙏';
            case 'adventure': return '🗻';
            case 'giving': return '🤝';
            default: return '🎯';
        }
    };

    const getTimeframeText = (timeframe) => {
        switch (timeframe) {
            case 'short': return '1 year';
            case 'medium': return '5 years';
            case 'long': return '10+ years';
            case 'lifetime': return 'Lifetime';
            default: return '';
        }
    };

    const getTimeframeColor = (timeframe) => {
        switch (timeframe) {
            case 'short': return '#4CAF50';
            case 'medium': return '#FF9800';
            case 'long': return '#9C27B0';
            case 'lifetime': return '#F44336';
            default: return '#666';
        }
    };

    // Get the title based on viewOnly mode
    const getTitle = () => {
        if (viewOnly && userData) {
            const name = userData.firstName || 'User';
            return `🎯 Personal Goals`;
        }
        return '🎯 Life Goals';
    };

    const getExpandedTitle = () => {
        if (viewOnly && userData) {
            const name = userData.firstName || 'User';
            return `🎯 ${name}'s Life Vision`;
        }
        return '🎯 My Life Vision';
    };

    // Compact Widget View
    const CompactWidget = () => (
        <TouchableOpacity onPress={openExpanded} style={styles.widgetContainer} activeOpacity={0.8}>
            <LinearGradient
                colors={['#c61225', '#f5934b']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>{getTitle()}</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.stat}>{completedGoals.length} achieved</Text>
                        <Text style={styles.stat}>{activeGoals.length} active</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading goals...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
                        {lifeGoals.slice(0, 3).map((goal) => (
                            <View key={goal.id} style={styles.goalItem}>
                                <View style={styles.goalLeft}>
                                    <Text style={styles.goalEmoji}>{getCategoryEmoji(goal.category)}</Text>
                                    <View style={styles.goalInfo}>
                                        <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
                                        <Text style={styles.goalMeta}>{goal.category} • {getTimeframeText(goal.timeframe)}</Text>
                                    </View>
                                </View>
                                <View style={styles.compactRightSection}>
                                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(goal.status) }]} />
                                    <View style={[styles.timeframeDot, { backgroundColor: getTimeframeColor(goal.timeframe) }]} />
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.expandHint}>
                    <Text style={styles.expandHintText}>Tap to see all {lifeGoals.length} goals</Text>
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
            <StatusBar barStyle="light-content" backgroundColor="#c61225" />
            <LinearGradient
                colors={['#c61225', '#f5934b']}
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
                            <Text style={styles.expandedStatNumber}>{completedGoals.length}</Text>
                            <Text style={styles.expandedStatLabel}>Achieved</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{activeGoals.length}</Text>
                            <Text style={styles.expandedStatLabel}>In Progress</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{uniqueCategories.length}</Text>
                            <Text style={styles.expandedStatLabel}>Life Areas</Text>
                        </View>
                    </View>

                    {/* Category Tags */}
                    {uniqueCategories.length > 0 && (
                        <View style={styles.categoryContainer}>
                            <Text style={styles.categoryTitle}>Life Areas:</Text>
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

                    {/* Goals List */}
                    <ScrollView 
                        style={styles.expandedGoalsList} 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {lifeGoals.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>
                                    {viewOnly ? 'No life goals yet!' : 'No life goals yet!'}
                                </Text>
                                <Text style={styles.emptyStateSubtext}>
                                    {viewOnly 
                                        ? 'This user hasn\'t added any life goals yet' 
                                        : 'Add your first life goal to get started'
                                    }
                                </Text>
                            </View>
                        ) : (
                            lifeGoals.map((goal) => (
                                <View key={goal.id} style={styles.swipeableContainer}>
                                    <TouchableOpacity 
                                        style={styles.expandedGoalItem}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.expandedGoalHeader}>
                                            <View style={styles.goalLeft}>
                                                <Text style={styles.expandedGoalEmoji}>{getCategoryEmoji(goal.category)}</Text>
                                                <View style={styles.goalInfo}>
                                                    <Text style={styles.expandedGoalTitle}>{goal.title}</Text>
                                                    <Text style={styles.expandedGoalMeta}>{goal.category} • {getTimeframeText(goal.timeframe)}</Text>
                                                    <View style={styles.expandedGoalStatus}>
                                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(goal.status) }]}>
                                                            <Text style={styles.statusBadgeText}>{getStatusText(goal.status)}</Text>
                                                        </View>
                                                        <View style={[styles.timeframeBadge, { backgroundColor: getTimeframeColor(goal.timeframe) }]}>
                                                            <Text style={styles.timeframeBadgeText}>{getTimeframeText(goal.timeframe)}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                            
                                            {/* Only show action buttons if not in viewOnly mode */}
                                            {!viewOnly && (
                                                <View style={styles.goalActions}>
                                                    {/* Status Toggle Button */}
                                                    <TouchableOpacity
                                                        style={styles.statusToggleButton}
                                                        onPress={() => {
                                                            const newStatus = goal.status === 'achieved' ? 'in-progress' : 'achieved';
                                                            handleUpdateGoalStatus(goal.id, newStatus);
                                                        }}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={styles.statusToggleText}>
                                                            {goal.status === 'achieved' ? '↶' : '✓'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    {/* Delete Button */}
                                                    <TouchableOpacity
                                                        style={styles.deleteIconButton}
                                                        onPress={() => {
                                                            console.log('🗑️ Delete button pressed for goal:', goal.id, goal.title);
                                                            handleRemoveGoal(goal.id);
                                                        }}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={styles.deleteIconText}>🗑️</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                        
                                        {goal.description && (
                                            <Text style={styles.goalDescription}>"{goal.description}"</Text>
                                        )}
                                        
                                        {goal.targetDate && (
                                            <View style={styles.targetDateContainer}>
                                                <Text style={styles.targetDateText}>Target: {new Date(goal.targetDate).toLocaleDateString()}</Text>
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
                            onPress={handleAddGoal}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.expandedAddButtonText}>+ Add New Goal</Text>
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
    goalsList: {
        flex: 1,
    },
    goalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        padding: 8,
        marginBottom: 6,
    },
    goalLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    goalEmoji: {
        fontSize: 16,
        marginRight: 8,
    },
    goalInfo: {
        flex: 1,
    },
    goalTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    goalMeta: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
        textTransform: 'capitalize',
    },
    compactRightSection: {
        alignItems: 'center',
        gap: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    timeframeDot: {
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
    expandedGoalsList: {
        flex: 1,
    },
    swipeableContainer: {
        marginBottom: 12,
    },
    expandedGoalItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 16,
    },
    expandedGoalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    goalActions: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
    },
    expandedGoalEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    expandedGoalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    expandedGoalMeta: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 8,
        textTransform: 'capitalize',
    },
    expandedGoalStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
    timeframeBadge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    timeframeBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    statusToggleButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    statusToggleText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
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
    goalDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontStyle: 'italic',
        lineHeight: 20,
        marginBottom: 8,
    },
    targetDateContainer: {
        alignItems: 'flex-end',
    },
    targetDateText: {
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

export default LifeGoalsWidget;