import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { Provider } from 'react-redux';
import store from './store';
import { CompanySettingsProvider } from './contexts/CompanySettingsContext';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Provider store={store}>
          <AuthProvider>
            <CompanySettingsProvider>
              <Navigation colorScheme={colorScheme} />
              <StatusBar />
            </CompanySettingsProvider>
          </AuthProvider>
        </Provider>
      </SafeAreaProvider>
    );
  }
}
