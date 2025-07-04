import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Image,
  Text,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';

import Toast from 'react-native-toast-message';
import { saveDeviceId } from './android/api';

const webURL = 'https://spareconnect.in/dev/';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const webviewRef = useRef<any>(null);

  const getLocalStorage = (key: string) => {
    if (webviewRef.current) {
      webviewRef.current.injectJavaScript(`
        (function() {
          const value = localStorage.getItem('${key}');
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'GET_LOCALSTORAGE',
            key: '${key}',
            value: value
          }));
        })();
        true;
      `);
    }
  };

  useEffect(() => {
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted.');
      } else {
        console.log('Notification permission denied.');
      }
    };

    requestPermission();

    // Foreground notifications → show toast
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('📩 Foreground FCM:', remoteMessage);
      Toast.show({
        type: 'success',
        text1: remoteMessage.notification?.title || 'New Message',
        text2: remoteMessage.notification?.body || '',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
    });

    // Background handler → manually display system notification if data-only

    // Opened from quit
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('🚀 Opened from quit:', remoteMessage);
          handleNotificationAction(remoteMessage);
        }
      });

    // Opened from background
    const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('🚀 Opened from background:', remoteMessage);
        handleNotificationAction(remoteMessage);
      },
    );

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpened();
    };
  }, []);

  const goToRoute = () => {
    try {
      const targetUrl = webURL + 'my-account/custom-requests/';
      webviewRef.current?.loadUrl(targetUrl);
    } catch (error) {
      console.error('Error navigating to route:', error);
    }
  };

  const handleNotificationAction = (remoteMessage: any) => {
    // if (remoteMessage?.data?.url)
    {
      if (webviewRef.current) {
        goToRoute();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.webviewContainer}>
        <WebView
          ref={webviewRef}
          source={{ uri: webURL }}
          onLoadEnd={() => {
            setLoading(false);
            getLocalStorage('wp_user_id');
          }}
          onError={() => setLoading(false)}
          onHttpError={() => setLoading(false)}
          style={{ flex: 1 }}
          onMessage={event => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              console.log('WebView message:', data);

              if (data.key === 'wp_user_id' && data.value) {
                if (!registered) {
                  saveDeviceId({
                    user_id: data.value,
                  }).then(response => {
                    console.log('Device ID saved:', response);
                    setRegistered(true);
                  });
                }
              }
            } catch (e) {
              console.warn('Invalid WebView message:', event.nativeEvent.data);
            }
          }}
        />
        {loading && (
          <View style={styles.overlayContainer}>
            <View style={styles.loaderWrapper}>
              <Image
                source={require('./logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.loadingText}>Loading, please wait...</Text>
              <ActivityIndicator size="large" color="#007BFF" />
            </View>
          </View>
        )}
      </View>

      <Toast topOffset={Platform.OS === 'android' ? 60 : 40} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  loaderWrapper: {
    width: 200,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 14,
    marginBottom: 10,
    color: '#444',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default App;
