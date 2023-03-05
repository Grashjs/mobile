import { ScrollView, StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { NotificationType } from '../models/notification';
import { editNotification } from '../slices/notification';
import Notification from '../models/notification';
import { RootStackParamList, RootStackScreenProps } from '../types';
import { useDispatch, useSelector } from '../store';
import {
  getAssetUrl,
  getLocationUrl,
  getMeterUrl,
  getPartUrl,
  getRequestUrl,
  getTeamUrl,
  getWorkOrderUrl
} from '../utils/urlPaths';
import { List, useTheme } from 'react-native-paper';
import { useContext } from 'react';
import { CompanySettingsContext } from '../contexts/CompanySettingsContext';
import { useNavigation } from '@react-navigation/native';

export default function NotificationsScreen({
                                              navigation
                                            }: RootStackScreenProps<'Notifications'>) {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);
  const theme = useTheme();
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const onReadNotification = (notification: Notification) => {
    let url: { route: keyof RootStackParamList, params: {} };
    const id = notification.resourceId;
    switch (notification.notificationType) {
      case 'INFO':
        break;
      case 'ASSET':
        url = getAssetUrl(id);
        break;
      case 'REQUEST':
        url = getRequestUrl(id);
        break;
      case 'WORK_ORDER':
        url = getWorkOrderUrl(id);
        break;
      case 'PART':
        url = getPartUrl(id);
        break;
      case 'METER':
        url = getMeterUrl(id);
        break;
      case 'LOCATION':
        url = getLocationUrl(id);
        break;
      case 'TEAM':
        url = getTeamUrl(id);
        break;
      default:
        break;
    }
    if (notification.seen) {
      if (url) {
        // @ts-ignore
        navigation.navigate(url.route, url.params);
      }
    } else
      dispatch(editNotification(notification.id, { seen: true }))
        .then(() => {
          if (url) {
            // @ts-ignore
            navigation.navigate(url.route, url.params);
          }
        });
  };
  const notificationIcons: Record<NotificationType, IconSource> = {
    ASSET: 'package-variant-closed',
    LOCATION: 'map-marker-outline',
    METER: 'gauge',
    PART: 'archive-outline',
    REQUEST: 'inbox-arrow-down-outline',
    TEAM: 'account-outline',
    WORK_ORDER: 'clipboard-text-outline',
    INFO: 'information',
    PURCHASE_ORDER: 'comma-circle-outline'
  };
  return (
    <ScrollView style={styles.container}>
      <List.Section>
        {[...notifications].reverse().map((notification) => (
          // @ts-ignore
          <List.Item
            title={notification.message}
            titleNumberOfLines={2}
            description={getFormattedDate(notification.createdAt)}
            left={(props) => <List.Icon {...props} icon={notificationIcons[notification.notificationType]}
                                        color={notification.seen ? 'black' : theme.colors.primary} />}
            style={{ backgroundColor: notification.seen ? 'white' : theme.colors.background }}
            key={notification.id}
            onPress={() => onReadNotification(notification)}
          >
          </List.Item>
        ))}
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
});
