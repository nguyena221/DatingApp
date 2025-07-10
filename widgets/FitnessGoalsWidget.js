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

const FitnessGoalsWidget = ({ navigation }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [fitnessGoals, setFitnessGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    // Load fitness goals from database when component mounts or regains focus
    useFocusEffect(
        useCallback(() => {
            loadGoalsFromDatabase();
        }, [])
    );

    const loadGoalsFromDatabase = async () => {
        try {
            setLoading(true);
            const userEmail = user?.email;
            if (!userEmail) {
                console.log("No user logged in");
                setFitnessGoals([]);
                setLoading(false);
                return;
            }
            
            const result = await getUserWidgetData(userEmail, 'fitness');
            
            if (result.success && result.data) {
                setFitnessGoals(result.data.goals || []);
            } else {
                console.log("No fitness goals data found, starting with empty array");
                setFitnessGoals([]);
            }
        } catch (error) {
            console.error("Error loading fitness goals:", error);
            setFitnessGoals([]);
        } finally {
            setLoading(false);
        }
    };

    const completedGoals = fitnessGoals.filter(g => g.status === 'completed');
    const activeGoals = fitnessGoals.filter(g => g.status === 'active');
    const averageProgress = fitnessGoals.length > 0 ? 
        Math.round(fitnessGoals.reduce((sum, goal) => sum + goal.progress, 0) / fitnessGoals.length) : 0;

    const openExpanded = () => {
        setIsExpanded(true);
    };

    const closeExpanded = () => {
        setIsExpanded(false);
    };

    // Navigate to AddFitnessGoal screen
    const handleAddGoal = () => {
        console.log('💪 Navigating to AddFitnessGoal screen');
        console.log('💪 Navigation object:', navigation);
        
        // Close the expanded modal first
        setIsExpanded(false);
        
        // Then navigate after a small delay to ensure modal is closed
        setTimeout(() => {
            if (navigation && navigation.navigate) {
                navigation.navigate('AddFitnessGoal');
            } else {
                console.error('❌ Navigation not available');
                Alert.alert('Error', 'Navigation not available. Please try again.');
            }
        }, 300);
    };

    const handleRemoveGoal = async (goalId) => {
        console.log('🗑️ handleRemoveGoal called with goalId:', goalId);
        
        Alert.alert(
            'Remove Goal',
            'Are you sure you want to remove this fitness goal?',
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
                            
                            const result = await removeWidgetItem(userEmail, 'fitness', goalId);
                            console.log('🗑️ Database result:', result);
                            
                            if (result.success) {
                                console.log('✅ Goal removed from database, updating local state');
                                setFitnessGoals(prevGoals => {
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

    const handleUpdateGoalProgress = async (goalId, newProgress) => {
        try {
            const userEmail = user?.email;
            if (!userEmail) {
                Alert.alert('Error', 'User not logged in');
                return;
            }
            
            // Determine new status based on progress
            const newStatus = newProgress >= 100 ? 'completed' : 'active';
            
            const result = await updateWidgetItem(userEmail, 'fitness', goalId, { 
                progress: newProgress,
                status: newStatus
            });
            
            if (result.success) {
                setFitnessGoals(prevGoals => 
                    prevGoals.map(goal => 
                        goal.id === goalId ? { ...goal, progress: newProgress, status: newStatus } : goal
                    )
                );
            } else {
                Alert.alert('Error', result.message || 'Failed to update progress');
            }
        } catch (error) {
            console.error("Error updating progress:", error);
            Alert.alert('Error', 'Failed to update progress');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#4CAF50';
            case 'active': return '#FF9800';
            case 'paused': return '#9E9E9E';
            default: return '#666';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'active': return 'Active';
            case 'paused': return 'Paused';
            default: return '';
        }
    };

    const getCategoryEmoji = (category) => {
        switch (category) {
            case 'strength': return '🏋️';
            case 'cardio': return '🏃';
            case 'flexibility': return '🧘';
            case 'weight-loss': return '⚖️';
            case 'muscle-gain': return '💪';
            case 'endurance': return '🚴';
            case 'sports': return '⚽';
            default: return '🎯';
        }
    };

    const renderProgressBar = (progress, width = 60) => {
        return (
            <View style={[styles.progressBarContainer, { width }]}>
                <View 
                    style={[
                        styles.progressBarFill, 
                        { 
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: progress >= 100 ? '#4CAF50' : '#FF9800'
                        }
                    ]} 
                />
                <Text style={styles.progressText}>{progress}%</Text>
            </View>
        );
    };

    // Compact Widget View
    const CompactWidget = () => (
        <TouchableOpacity onPress={openExpanded} style={styles.widgetContainer} activeOpacity={0.8}>
            <LinearGradient
                colors={['#11998e', '#38ef7d']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>💪 Fitness Goals</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.stat}>{completedGoals.length} done</Text>
                        <Text style={styles.stat}>{averageProgress}% avg</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading goals...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
                        {fitnessGoals.slice(0, 3).map((goal) => (
                            <View key={goal.id} style={styles.goalItem}>
                                <View style={styles.goalLeft}>
                                    <Text style={styles.goalEmoji}>{getCategoryEmoji(goal.category)}</Text>
                                    <View style={styles.goalInfo}>
                                        <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
                                        <Text style={styles.goalTarget}>{goal.target}</Text>
                                    </View>
                                </View>
                                <View style={styles.compactRightSection}>
                                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(goal.status) }]} />
                                    {renderProgressBar(goal.progress, 50)}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.expandHint}>
                    <Text style={styles.expandHintText}>Tap to see all {fitnessGoals.length} goals</Text>
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
            <StatusBar barStyle="light-content" backgroundColor="#11998e" />
            <LinearGradient
                colors={['#11998e', '#38ef7d']}
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
                        <Text style={styles.expandedTitle}>💪 My Fitness Journey</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Stats */}
                    <View style={styles.expandedStatsContainer}>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{completedGoals.length}</Text>
                            <Text style={styles.expandedStatLabel}>Completed</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{activeGoals.length}</Text>
                            <Text style={styles.expandedStatLabel}>Active</Text>
                        </View>
                        <View style={styles.expandedStatBox}>
                            <Text style={styles.expandedStatNumber}>{averageProgress}%</Text>
                            <Text style={styles.expandedStatLabel}>Avg Progress</Text>
                        </View>
                    </View>

                    {/* Goals List */}
                    <ScrollView 
                        style={styles.expandedGoalsList} 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {fitnessGoals.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No fitness goals yet!</Text>
                                <Text style={styles.emptyStateSubtext}>Add your first fitness goal to get started</Text>
                            </View>
                        ) : (
                            fitnessGoals.map((goal) => (
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
                                                    <Text style={styles.expandedGoalTarget}>{goal.target}</Text>
                                                    <View style={styles.expandedGoalMeta}>
                                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(goal.status) }]}>
                                                            <Text style={styles.statusBadgeText}>{getStatusText(goal.status)}</Text>
                                                        </View>
                                                        <Text style={styles.categoryText}>{goal.category}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={styles.goalActions}>
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
                                        </View>
                                        
                                        {/* Progress Bar */}
                                        <View style={styles.progressSection}>
                                            <Text style={styles.progressLabel}>Progress</Text>
                                            {renderProgressBar(goal.progress, 200)}
                                            <View style={styles.progressButtons}>
                                                <TouchableOpacity
                                                    style={styles.progressButton}
                                                    onPress={() => handleUpdateGoalProgress(goal.id, Math.max(0, goal.progress - 10))}
                                                >
                                                    <Text style={styles.progressButtonText}>-10%</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.progressButton}
                                                    onPress={() => handleUpdateGoalProgress(goal.id, Math.min(100, goal.progress + 10))}
                                                >
                                                    <Text style={styles.progressButtonText}>+10%</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        
                                        {goal.description && (
                                            <Text style={styles.goalDescription}>"{goal.description}"</Text>
                                        )}
                                        
                                        {goal.deadline && (
                                            <View style={styles.deadlineContainer}>
                                                <Text style={styles.deadlineText}>Target: {new Date(goal.deadline).toLocaleDateString()}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {/* Add Button */}
                    <TouchableOpacity 
                        style={styles.expandedAddButton}
                        onPress={handleAddGoal}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.expandedAddButtonText}>+ Add New Goal</Text>
                    </TouchableOpacity>
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
    goalTarget: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    compactRightSection: {
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: 4,
    },
    progressBarContainer: {
        height: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 8,
        position: 'relative',
        justifyContent: 'center',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 8,
        position: 'absolute',
        left: 0,
    },
    progressText: {
        fontSize: 10,
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
    expandedGoalTarget: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 8,
    },
    expandedGoalMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
    categoryText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
        textTransform: 'capitalize',
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
    progressSection: {
        marginBottom: 12,
    },
    progressLabel: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
        marginBottom: 8,
    },
    progressButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 8,
    },
    progressButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    progressButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    goalDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontStyle: 'italic',
        lineHeight: 20,
        marginBottom: 8,
    },
    deadlineContainer: {
        alignItems: 'flex-end',
    },
    deadlineText: {
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

export default FitnessGoalsWidget;