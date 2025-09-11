/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

AppRegistry.registerComponent(appName, () => App);

// Background/quit state message handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('FCM background message:', JSON.stringify(remoteMessage));
  // Let Firebase handle display notifications in background.
  // For data-only messages, you can handle custom logic here if needed.
});
