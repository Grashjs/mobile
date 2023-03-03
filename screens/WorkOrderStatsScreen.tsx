import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';
import { useDispatch, useSelector } from '../store';
import { useEffect } from 'react';
import { getMobileExtendedStats } from '../slices/analytics/workOrder';
import { RootStackScreenProps, RootTabScreenProps } from '../types';
import { useTranslation } from 'react-i18next';
import { useTheme, Text } from 'react-native-paper';

export default function WorkOrderStatsScreen({ navigation, route }: RootStackScreenProps<'WorkOrderStats'>) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const theme = useTheme();
  const { mobileExtended, loading } = useSelector(state => state.woAnalytics);
  useEffect(() => {
    dispatch(getMobileExtendedStats());
  }, []);

  return (
    <ScrollView style={{ ...styles.container, backgroundColor: theme.colors.background }}
                refreshControl={<RefreshControl refreshing={loading.mobileExtended} colors={[theme.colors.primary]} />}>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text variant={'titleLarge'} style={{ marginVertical: 20 }}>{t('complete_work_orders')}</Text>
        <View style={{ ...styles.row, justifyContent: 'space-between', width: '100%', padding: 20 }}>
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ width: '100%' }} variant={'titleMedium'}>{t('this_week')}</Text>
            <Text>{mobileExtended.completeWeek}</Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ width: '100%' }} variant={'titleMedium'}>{t('all_time')}</Text>
            <Text>{mobileExtended.complete}</Text>
          </View>
        </View>
      </View>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text variant={'titleLarge'} style={{ marginVertical: 20 }}>{t('compliant_work_orders')}</Text>
        <View style={{ ...styles.row, justifyContent: 'space-between', width: '100%', padding: 20 }}>
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ width: '100%' }} variant={'titleMedium'}>{t('this_week')}</Text>
            <Text>{`${(mobileExtended.compliantRateWeek * 100).toFixed(2)}%`}</Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ width: '100%' }} variant={'titleMedium'}>{t('all_time')}</Text>
            <Text>{`${(mobileExtended.compliantRate * 100).toFixed(2)}%`}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    display: 'flex',
    flexDirection: 'row'
  }
});
