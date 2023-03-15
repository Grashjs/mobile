import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { NotificationType } from '../models/notification';
import { editNotification, getMoreNotifications } from '../slices/notification';
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
import { List, useTheme, Text } from 'react-native-paper';
import { useContext } from 'react';
import { CompanySettingsContext } from '../contexts/CompanySettingsContext';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { getMoreAssets } from '../slices/asset';
import { SearchCriteria } from '../models/page';

export default function NotificationsScreen({
                                              navigation
                                            }: RootStackScreenProps<'Notifications'>) {
  const dispatch = useDispatch();
  const { notifications, loadingGet, lastPage, currentPageNum } = useSelector((state) => state.notifications);
  const criteria: SearchCriteria = {
    filterFields: [],
    pageSize: 15,
    pageNum: 0,
    direction: 'DESC'
  };
  const theme = useTheme();
  const { t } = useTranslation();
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
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
  return (
    <ScrollView style={styles.container}
                refreshControl={<RefreshControl refreshing={loadingGet} colors={[theme.colors.primary]} />}
                onScroll={({ nativeEvent }) => {
                  if (isCloseToBottom(nativeEvent)) {
                    if (!loadingGet && !lastPage)
                      dispatch(getMoreNotifications(criteria, currentPageNum + 1));
                  }
                }}>
      {Boolean(notifications.content.length) ? <List.Section>
        {notifications.content.map((notification) => (
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
      </List.Section> : <View style={{ backgroundColor: 'white', padding: 20, alignItems: 'center', borderRadius: 10 }}>
        <Text variant={'titleMedium'} style={{ fontWeight: 'bold' }}> {t('no_notification')}</Text>
        < Text variant={'bodyMedium'}>{t('no_notification_message')}</Text>
      </View>}
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
