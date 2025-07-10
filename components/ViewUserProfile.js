import React, { useRef } from 'react';
import { FlatList, Dimensions, Animated, View } from 'react-native';
import ViewUserProfileStart from './ViewUserProfileStart';
import ViewUserProfileWidgets from './ViewUserProfileWidgets';

const { height } = Dimensions.get('window');

// Create animated FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Main profile view with snap functionality for viewing other users
const ViewUserProfile = ({ route, navigation }) => {
  const { userData } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;

  const pages = [
    { id: '1', component: ViewUserProfileStart },
    { id: '2', component: ViewUserProfileWidgets },
  ];

  const renderPage = ({ item, index }) => {
    const PageComponent = item.component;
    return (
      <View style={{ height }}>
        <PageComponent 
          userData={userData}
          scrollY={index === 0 ? scrollY : null}
          navigation={navigation}
        />
      </View>
    );
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <AnimatedFlatList
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

export default ViewUserProfile;