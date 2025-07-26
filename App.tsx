import React from 'react';
import {StatusBar} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import NavigationApp from './src/NavigationApp';
import {theme} from './src/theme/theme';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <NavigationApp />
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;