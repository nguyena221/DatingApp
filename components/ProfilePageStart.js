import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native'; //safeareaview is avoiding weird iphone box at top
import { LinearGradient } from 'react-native-linear-gradient';
import React, { Component, useState, useEffect } from 'react';

export default function ProfilePageStart(props) {
    let [photoUrl, setPhotoUrl] = useState('');

    getProfilePhoto = async()=>{
        let response = await fetch("https://picsum.photos/200/20") //https://picsum.photos/200/20
        return response.url
    }

    useEffect(() => {
        const loadPhoto = async () => {
            const url = await getProfilePhoto();
            setPhotoUrl(url);
        };
        loadPhoto();
    }, []);

    return(
        <SafeAreaView style = {styles.container}>
            <TouchableOpacity style={styles.editProfileContainer}>
                <Text style={styles.editProfileText}>Edit</Text>
            </TouchableOpacity>
            <View style={styles.photoContainer}>
                <View style={styles.photoFrame}>
                    {photoUrl ? (
                        <Image 
                            source={{ uri: photoUrl }}
                            style={{ width: '100%', height: '100%' }}
                        />
                    ) : (
                        <View style={styles.loadingText}>
                        <Text>Loading...</Text>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.profileInfoContainer}>
                    <View style={styles.profileInfoNameContainer}>
                    </View>
            </View>
        </SafeAreaView>

    )
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
    editProfileContainer: {
            alignItems: 'center',
            height:23,
            position: 'absolute',
            right: 20,
            top:8,
            backgroundColor: 'rgba(128, 128, 128, 0.2)', // Gray with 20% opacity
            borderWidth: 1,
            borderColor: 'rgba(128, 128, 128, 0.4)', // Slightly more opaque border
            borderRadius:18, // Creates oval shape
            paddingVertical: 0,
            paddingHorizontal: 16,
    },
    editProfileText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        textAlign: 'center',
        opacity:0.6,
    },
    photoContainer:{
        height:200,
        width: '100%',
        alignItems: 'center',
        paddingTop:20
    },
    photoFrame: {
        width: 170,
        height: 170,
        borderRadius: 100, // Half of width/height for perfect circle
        overflow: 'hidden', // Clips image to circle shape
        borderWidth: 2,
        borderColor: '#ddd',
    },
    loadingText:{
        width: '100%', 
        height: '100%', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    profileInfoContainer: {
        flex:1,        
        marginTop:23,
    },
    profileInfoNameContainer:{
        height:100,
        justifyContent: 'flex-start'
    }
})