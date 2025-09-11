import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import SocketClient from './components/SocketClient';
import AdminPanel from './components/AdminPanel';
import messaging from '@react-native-firebase/messaging';
import { sendFcmToken } from './services/api';

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
    requestuserPerrmission();
    sendFcmToken();
  }, []);

  const [events, setEvents] = useState([]);

  const handleEvent = eventData => {
    setEvents(prevEvents => [eventData, ...prevEvents]);
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
