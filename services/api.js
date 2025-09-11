import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const sendFcmToken = async () => {
  try {
    await messaging().registerDeviceForRemoteMessages();

    let apns = null;
    if (Platform.OS === 'ios') {
      // Get APNs token (string) so you can test from Xcode Push panel
      apns = await messaging().getAPNSToken();
      if (apns) {
        console.log('🍏 APNs Token (hex):', apns);
        await AsyncStorage.setItem('apnToken', apns);
        console.log('💾 APNs Token saved to AsyncStorage');
      } else {
        console.log('⚠️ APNs token not yet available (will be provided after registration).');
      }
    }

    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    await axios.post('https://benefit-notification.onrender.com/save-token', {
      fcmToken: token,
      apnToken: apns,
    });
  } catch (error) {
    console.error('Error sending token:', error);
  }
};

export const getPayload = async () => {
  try {
    const response = await axios.get(
      'https://benefit-notification.onrender.com/api/get-payload',
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching payload:', error);
    throw error;
  }
};
