import React, { useRef, useState } from 'react';
import { FlatList, Dimensions, Animated } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import ProfilePageStart from './ProfilePageStart';
import ProfilePageWidgets from './ProfilePageWidgets';
import EditProfileScreen from './EditProfileScreen';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';

const { height } = Dimensions.get('window');
const Stack = createStackNavigator();

// Main profile view with snap functionality
const ProfileSnapView = ({ navigation, profileBgColor, setProfileBgColor }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const pages = [
    { id: '1', component: ProfilePageStart },
    { id: '2', component: ProfilePageWidgets },
  ];

  const renderPage = ({ item, index }) => {
    const PageComponent = item.component;
    return (
      <View style={{ height, paddingTop: 30 }}>
        <PageComponent 
          scrollY={index === 0 ? scrollY : null}
          navigation={navigation}
          profileBgColor={profileBgColor}
        />
      </View>
    );
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <FlatList
      data={pages}
      renderItem={renderPage}
      keyExtractor={(item) => item.id}
      pagingEnabled={true}
      showsVerticalScrollIndicator={false}
      snapToAlignment="start"
      decelerationRate="fast"
      onScroll={handleScroll}
      scrollEventThrottle={16}
    />
  );
};

// Stack Navigator Component
const PageSnapContainer = () => {
  const [profileBgColor, setProfileBgColor] = useState('#e3f2fd');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileView">
        {({ navigation }) => (
          <ProfileSnapView 
            navigation={navigation}
            profileBgColor={profileBgColor}
            setProfileBgColor={setProfileBgColor}
          />
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="EditProfile" 
        options={{
          presentation: 'modal',
          animationTypeForReplace: 'push',
        }}
      >
        {({ navigation }) => (
          <EditProfileScreen 
            navigation={navigation}
            selectedColor={profileBgColor}
            onColorChange={setProfileBgColor}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default PageSnapContainer;