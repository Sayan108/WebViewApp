import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const webURL = 'https://spareconnect.in/dev/';

const App = () => {
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: webURL }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
        onHttpError={() => setLoading(false)}
        style={{ flex: 1 }}
      />
      {loading && (
        <View style={styles.loaderWrapper}>
          <Image
            source={require('./logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>Loading, please wait...</Text>
          <ActivityIndicator
            size="large"
            color="#007BFF"
            style={styles.spinner}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loaderWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#444',
    fontWeight: '500',
  },
  spinner: {
    marginTop: 10,
  },
});

export default App;
