import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MessagesScreen from './MessagesScreen';
import ChatRoom from './ChatRoom';
import ViewUserProfile from './ViewUserProfile'; // Import your ViewUserProfile component

const MessagesStack = createStackNavigator();

export default function MessagesNavigator() {
  return (
    <MessagesStack.Navigator 
      screenOptions={{ 
        headerShown: false 
      }}
    >
      <MessagesStack.Screen 
        name="MessagesMain" 
        component={MessagesScreen} 
      />
      <MessagesStack.Screen 
        name="ChatRoom" 
        component={ChatRoom} 
      />
      <MessagesStack.Screen 
        name="ViewUserProfile" 
        component={ViewUserProfile}
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
    </MessagesStack.Navigator>
  );
}