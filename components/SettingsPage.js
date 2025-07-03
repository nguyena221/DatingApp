import { StyleSheet, Text, SafeAreaView,
    TouchableOpacity, View, Switch, ScrollView
 } from 'react-native';
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

export default class SettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      darkMode: false,
      notifications: true,
      sound: true,
      vibration: false,
    };
  }

  render() {
    return (
      <ScrollView style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.headerText}>Settings</Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Switch
              value={this.state.darkMode}
              onValueChange={(value) => this.setState({darkMode: value})}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Push Notifications</Text>
            <Switch
              value={this.state.notifications}
              onValueChange={(value) => this.setState({notifications: value})}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Sound</Text>
            <Switch
              value={this.state.sound}
              onValueChange={(value) => this.setState({sound: value})}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Vibration</Text>
            <Switch
              value={this.state.vibration}
              onValueChange={(value) => this.setState({vibration: value})}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingText}>Edit Profile</Text>
            <Text style={styles.arrow}></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingText}>Change Password</Text>
            <Text style={styles.arrow}></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingText}>Privacy Settings</Text>
            <Text style={styles.arrow}></Text>
          </TouchableOpacity>
        </View>

        {/* Other Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other</Text>
          
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingText}>Help & Support</Text>
            <Text style={styles.arrow}></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingText}>About</Text>
            <Text style={styles.arrow}></Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingButton, styles.logoutButton]}>
            <Text style={[styles.settingText, styles.logoutText]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => this.props.navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'blue',
    padding: 20,
    paddingTop: 50,
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Georgia-Italic',
    color: 'white',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 16,
    color: '#999',
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ff4444',
  },
  backButton: {
    backgroundColor: '#6200ee',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});