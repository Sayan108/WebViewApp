import { AppRegistry, Alert, Platform, PermissionsAndroid } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Request permission on app start
async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (permission === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('✅ POST_NOTIFICATIONS permission granted');
    } else {
      console.log('❌ POST_NOTIFICATIONS permission denied');
    }
  }
}

// Set background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('🔥 Background FCM:', remoteMessage);
});

// Set foreground handler
messaging().onMessage(async remoteMessage => {
  console.log('🔥 Foreground FCM:', remoteMessage);
});

// Call permission request at startup
requestNotificationPermission();

AppRegistry.registerComponent(appName, () => App);
