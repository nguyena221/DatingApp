import React, {Component} from 'react';
import { FlatList, Dimensions } from 'react-native';
import ProfilePageStart from './ProfilePageStart';
import ProfilePageWidgets from './ProfilePageWidgets';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';

const { height } = Dimensions.get('window');

const PageSnapContainer = () => {
  const pages = [
    { id: '1', component: ProfilePageStart },
    { id: '2', component: ProfilePageWidgets },
  ];

  const renderPage = ({ item }) => {
    const PageComponent = item.component;
    return (
      <View style={{ height, paddingTop:30 }}>
        <PageComponent />
      </View>
    );
  };

  return (
    <FlatList
      data={pages}
      renderItem={renderPage}
      keyExtractor={(item) => item.id}
      pagingEnabled={true}
      showsVerticalScrollIndicator={false}
      snapToAlignment="start"
      decelerationRate="fast"
    />
  );
};

export default PageSnapContainer;