import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native'; //safeareaview is avoiding weird iphone box at top
import React, { Component } from 'react';
import { Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SettingsPage from './SettingsPage';
import LogoutButton from '../components/LogoutButton';

const RootStack = createStackNavigator();

export default function DiscoverPage({ navigation }) {
    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)

    const panGestureEvent = useAnimatedGestureHandler({
        onStart: (event, context) => {
            context.translateX = translateX.value
            context.translateY = translateY.value
        }, // when touch square first time
        onActive: (event, context) => {
            translateX.value = event.translationX + context.translateX;
            translateY.value = event.translationY + context.translateY;
            //console.log(event.translationX);
        }, // when drag square along view
        onEnd: (event) => {
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
        }, //  at end
    });

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: translateX.value,
                },
                {
                    translateY: translateY.value
                }
            ]
        }
    })

    return(
        <SafeAreaView style={styles.container}>

            <LogoutButton />
            //settings button
            <TouchableOpacity
            onPress = {() => {navigation.navigate('Settings')}}
            >
                <View style={styles.topBar}>
                    <Ionicons name="settings-outline" size={25} color="black" />
                </View>
            </TouchableOpacity>

            //header text
            <View style={styles.headerContainer}>
                <Text style = {styles.text}>Discover</Text>
            </View>

            //profile card
            
                <View style={styles.cardContainer}>
                    <PanGestureHandler
                     onGestureEvent={panGestureEvent}
                    >
                        <Animated.View style={[styles.profileCard, rStyle]}>
                        </Animated.View>
                    </PanGestureHandler>
                </View>

            
            
        </SafeAreaView>
        
    )
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            backgroundColor: 'white'
        },
        topBar: {
            alignItems: 'flex-end',
            height:30,
            position: 'absolute',
            right: 20
        },
        headerContainer: {
            height: 30,
            alignItems: 'center'
        },
        text: {
            fontFamily: 'Georgia-Italic',
            fontSize:25,
            color: 'black',
            letterSpacing: 0.38,
        },
        cardContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
        },

        profileCard: {
            height: 550,
            backgroundColor:'blue',
            marginTop:20,
            width: 300,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20, //borderRadius would do all corners
        },
    }
);