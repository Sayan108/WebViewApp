import axios from 'axios';

import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import { Alert } from 'react-native';

export const getDeviceFCMToken = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const token = await messaging().getToken();
    console.log('FCM Device Token:', token);
    // Alert.alert('FCM Token', token);
    return token;
  } else {
    console.warn('Permission not granted for notifications');
    return null;
  }
};

const getUniqueId = async () => {
  const id = await DeviceInfo.getUniqueId();
  console.log('Unique Device ID:', id);
  return id;
};

// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'https://spareconnect.in/dev/wp-json/custom/v1', // Dummy API base URL
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dummy POST request
export const saveDeviceId = async ({ user_id }: { user_id: string }) => {
  try {
    const device_id = await getDeviceFCMToken(); //  getUniqueId();
    if (!device_id) {
      throw new Error('Device ID not available');
    }
    console.log('Saving device ID:', { user_id, device_id });
    const response = await apiClient.post('/save-device-id', {
      user_id,
      device_id,
    });
    console.log('Device ID saved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Save device ID error:', error);
    throw error;
  }
};

// Dummy POST request
export const sendFCM = async (data: object) => {
  try {
    const response = await apiClient.post('/send-fcm-test', data);
    return response.data;
  } catch (error) {
    console.error('Send FCM error:', error);
    throw error;
  }
};
