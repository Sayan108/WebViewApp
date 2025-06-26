import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const webURL = 'https://spareconnect.in/dev/';

const App = () => {
  const [loading, setLoading] = useState<boolean>(true);
  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <ActivityIndicator style={styles.loader} size="large" color="blue" />
      )}
      <WebView
        source={{ uri: webURL }}
        onLoadEnd={e => setLoading(false)}
        style={{ flex: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
  },
});

export default App;
