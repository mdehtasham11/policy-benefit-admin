import { Alert, Linking, Platform } from 'react-native';
import {
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';

export const NotificationPermission = async () => {
  const { status } = await checkNotifications();

  if (status === 'blocked' || status === 'denied') {
    // Notifications are OFF → show alert
    Alert.alert(
      'Enable Notifications',
      'Please turn on notifications to receive alerts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:'); // iOS settings
            } else {
              Linking.openSettings(); // Android settings
            }
          },
        },
      ],
    );
  } else if (status === 'notDetermined') {
    // Ask permission first time
    await requestNotifications(['alert', 'sound', 'badge']);
  }
};
