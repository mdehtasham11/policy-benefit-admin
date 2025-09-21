import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import SocketClient from './components/SocketClient';
import AdminPanel from './components/AdminPanel';
import messaging from '@react-native-firebase/messaging';
import { sendFcmToken } from './services/api';

import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationPermission } from './services/notification';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';


export default function App() {
  async function requestuserPerrmission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      } else {
        console.log('Notifications not authorized:', authStatus);
      }
    } catch (error) {
      console.log('Permission request error:', error);
    }
  }

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('>>>', remoteMessage);
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    requestuserPerrmission();
    
    NotificationPermission();
  }, []);

  const [events, setEvents] = useState([]);

  const handleEvent = eventData => {
    setEvents(prevEvents => [eventData, ...prevEvents]);
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <SocketClient onEvent={handleEvent}>
          {({
            connected,
            // socketId,
            socketUrl,
            checkConnection,
            soundService,
          }) => (
            <AdminPanel
              events={events}
              connected={connected}
              onClearEvents={clearEvents}
              // socketId={socketId}
              socketUrl={socketUrl}
              checkConnection={checkConnection}
              soundService={soundService}
            />
          )}
        </SocketClient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
