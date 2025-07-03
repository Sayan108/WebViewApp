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
import messaging, { firebase } from '@react-native-firebase/messaging';
import { saveDeviceId } from './android/api';

const webURL = 'https://spareconnect.in/dev/';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const webviewRef = useRef<any>(null);

  // Function to ask WebView for localStorage value
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

    // Foreground listener
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('FCM Message received in foreground:', remoteMessage);
    });

    // Background + quit state handler (if you want to navigate or handle data)
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('FCM Message handled in background:', remoteMessage);
      // Handle background logic here
    });

    // Handle when app opened from quit state by tapping notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'App opened from quit state by notification:',
            remoteMessage,
          );
        }
      });

    // Handle when app brought to foreground from background by tapping notification
    const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log(
          'App opened from background by notification:',
          remoteMessage,
        );
      },
    );

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpened();
    };
  }, []);

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
                    console.log('Device ID saved successfully:', response);
                    setRegistered(true);
                  });
                }
              }
            } catch (e) {
              console.warn(
                'Invalid message from WebView:',
                event.nativeEvent.data,
              );
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
