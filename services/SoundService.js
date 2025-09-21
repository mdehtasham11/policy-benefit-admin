import Sound from 'react-native-sound';
import { Platform } from 'react-native';

let sound = null;
let isEnabled = false;
let volume = 0.75;

const initializeSound = () => {
  // Enable playback in silence mode
  Sound.setCategory('Playback');

  // Use different paths for iOS and Android
  const soundPath = Platform.OS === 'ios' 
    ? 'notification.wav'  // iOS will look in main bundle
    : 'notification.wav'; // Android will look in res/raw

  sound = new Sound(soundPath, Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.log('Failed to load notification sound:', error);
      if (Platform.OS === 'ios') {
        console.log('💡 Make sure notification.wav is added to iOS project in Xcode');
      } else {
        console.log('💡 Make sure notification.wav exists in android/app/src/main/res/raw/');
      }
    } else {
      console.log('Notification sound loaded successfully');
    }
  });
};

// Initialize sound 
initializeSound();


const setEnabled = enabled => {
  isEnabled = enabled;
};

const setVolume = newVolume => {
  volume = Math.max(0, Math.min(1, newVolume));
  if (sound) {
    sound.setVolume(volume);
  }
};

const playNotification = (eventType = 'default') => {
  if (!isEnabled || !sound) {
    console.log('Sound disabled or not loaded. Event type:', eventType);
    return;
  }

  // Play sound for ALL event types
  console.log('Playing notification sound for event type:', eventType);
  sound.setVolume(volume);
  sound.play(success => {
    if (success) {
      console.log('Notification sound played successfully for:', eventType);
    } else {
      console.log('Failed to play notification sound for:', eventType);
    }
  });
};

const testSound = () => {
  if (sound) {
    sound.setVolume(volume);
    sound.play(success => {
      if (success) {
        console.log('Test sound played successfully');
      } else {
        console.log('Failed to play test sound');
      }
    });
  }
};

const release = () => {
  if (sound) {
    sound.release();
  }
};

export default {
  setEnabled,
  setVolume,
  playNotification,
  testSound,
  release,
};
