import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native'; //safeareaview is avoiding weird iphone box at top
import React, { Component } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import TravelPinsWidget from '../widgets/TravelPinsWidget';
import FavoriteMoviesWidget from '../widgets/FavoriteMoviesWidget';
import FavoriteBooksWidget from '../widgets/FavoriteBooksWidget';
import FoodieSpotsWidget from '../widgets/FoodieSpotsWidget';

export default class ProfilePageWidgets extends Component {
    render() {
        return(
            <SafeAreaView style={styles.container}>
                <View style={styles.infoPanelsContainer}>
                    <View style={styles.topRow}>
                        <View style={styles.infoPanel}>
                            <TravelPinsWidget />
                        </View>
                        <View style={styles.infoPanel}>
                            <FavoriteMoviesWidget/>
                        </View>
                    </View>
                    <View style={styles.bottomRow}>
                        <View style={styles.infoPanel}>
                            <FavoriteBooksWidget/>
                        </View>
                        <View style={styles.infoPanel}>
                            <FoodieSpotsWidget/>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'black',
        fontFamily: 'Georgia-Italic', // Match your DiscoverPage style
    },
    infoPanelsContainer:{
        flex:1,
        paddingTop:0,
        justifyContent:'space-evenly'
    },
    infoPanel: {
        height: 360,
        width: 180,
        borderRadius: 8
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
});