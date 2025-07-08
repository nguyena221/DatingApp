import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native'; //safeareaview is avoiding weird iphone box at top
import { LinearGradient } from 'react-native-linear-gradient';
import React, { Component } from 'react';

export default class ProfilePageWidgets extends Component {
    render() {
        return(
            <SafeAreaView style={styles.container}>
                <View style={styles.infoPanelsContainer}>
                    <View style={styles.topRow}>
                        <View style={styles.infoPanel}>
                        </View>
                        <View style={styles.infoPanel}>
                        </View>
                    </View>
                    <View style={styles.bottomRow}>
                        <View style={styles.infoPanel}>
                        </View>
                        <View style={styles.infoPanel}>
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
        backgroundColor: 'blue',
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