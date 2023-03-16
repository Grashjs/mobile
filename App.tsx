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
import { MD3LightTheme as DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { useEffect, useRef, useState } from 'react';
import { Alert, Linking, LogBox, Platform } from 'react-native';
import { SheetProvider } from 'react-native-actions-sheet';
import './components/actionSheets/sheets';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import api from './utils/api';
import { getNotificationUrl } from './utils/urlPaths';
import { NotificationType } from './models/notification';
import { navigate } from './navigation/RootNavigation';
import * as Permissions from 'expo-permissions';
import { useTranslation } from 'react-i18next';

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

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5569ff'
    });
  }

  return token;
}

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const [notification, setNotification] = useState<Notifications.Notification>(null);
  const notificationListener = useRef<Subscription>();
  const { t } = useTranslation();
  const savePushToken =
    (token: string) =>
      api.post<{ success: boolean }>(
        `notifications/push-token`,
        { token }
      );
  const responseListener = useRef<Subscription>();
  const checkPushNotificationState = async () => {
    let { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );

    if (existingStatus !== 'granted') {
      const status = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      existingStatus = status.status;
    }
    if (existingStatus !== 'granted') {
      Alert.alert(
        'No Notification Permission',
        'Please goto setting and activate notification permission manually',
        [
          { text: t('cancel'), onPress: () => console.log('cancel') },
          { text: t('allow'), onPress: () => Linking.openURL('app-settings:') }
        ],
        { cancelable: false }
      );
      return;
    }
  };
  useEffect(() => {
    LogBox.ignoreLogs(['Warning: Async Storage has been extracted from react-native core']);
    checkPushNotificationState().then(() =>
      registerForPushNotificationsAsync().then(token => savePushToken(token)));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      //TODO maybe showNotification alert
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      const type = data.type as NotificationType;
      const id = data.id as number;
      let url = getNotificationUrl(type, id);
      if (url) {
        navigate(url.route, url.params);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
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
};
