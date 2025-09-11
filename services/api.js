import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

export const sendFcmToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    await axios.post('https://benefit-notification.onrender.com/save-token', {
      fcmToken: token,
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
