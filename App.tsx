import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { Provider } from 'react-redux';
import { Subscription } from 'expo-modules-core';
import store from './store';
import { CompanySettingsProvider } from './contexts/CompanySettingsContext';
import { CustomSnackbarProvider } from './contexts/CustomSnackBarContext';
import { AuthProvider } from './contexts/AuthContext';
import {
  MD3LightTheme as DefaultTheme,
  Provider as PaperProvider
} from 'react-native-paper';
import { useEffect, useRef, useState } from 'react';
import { LogBox } from 'react-native';
import { SheetProvider } from 'react-native-actions-sheet';
import './components/actionSheets/sheets';
import * as Notifications from 'expo-notifications';
import { getNotificationUrl } from './utils/urlPaths';
import { NotificationType } from './models/notification';
import { navigate } from './navigation/RootNavigation';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#5569ff',
    secondary: '#959be0',
    tertiary: '#9DA1A1',
    background: '#ebecf6',
    secondaryContainer: '#7b7d93',
    success: '#57CA22',
    warning: '#FFA319',
    error: '#FF1943',
    info: '#33C2FF',
    black: '#223354',
    white: '#ffffff',
    primaryAlt: '#000C57',
    primaryContainer: '#333586',
    tertiaryContainer: 'black'
  }
};
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const [notification, setNotification] =
    useState<Notifications.Notification>(null);
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  useEffect(() => {
    LogBox.ignoreLogs([
      'Warning: Async Storage has been extracted from react-native core'
    ]);

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
        //TODO maybe showNotification alert
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        const type = data.type as NotificationType;
        const id = data.id as number;
        let url = getNotificationUrl(type, id);
        if (url) {
          navigate(url.route, url.params);
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  /*  useEffect(() => {
      TODO remove
      console.log(expoPushToken);
    }, [expoPushToken]);*/

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Provider store={store}>
          <AuthProvider>
            <CompanySettingsProvider>
              <PaperProvider theme={theme}>
                <CustomSnackbarProvider>
                  <SheetProvider>
                    <Navigation colorScheme={colorScheme} />
                    <StatusBar />
                  </SheetProvider>
                </CustomSnackbarProvider>
              </PaperProvider>
            </CompanySettingsProvider>
          </AuthProvider>
        </Provider>
      </SafeAreaProvider>
    );
  }
}
