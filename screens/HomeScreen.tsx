import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import { IconButton, useTheme, Text, Switch } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ExtendedWorkOrderStatus, getStatusColor } from '../utils/overall';
import { FilterField } from '../models/page';
import useAuth from '../hooks/useAuth';
import { useEffect } from 'react';
import { getMobileOverviewStats } from '../slices/analytics/workOrder';
import { useDispatch, useSelector } from '../store';
import * as React from 'react';

export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { userSettings, fetchUserSettings, patchUserSettings, user } = useAuth();
  const { mobileOverview, loading } = useSelector(state => state.woAnalytics);
  const iconButtonStyle = { ...styles.iconButton, backgroundColor: theme.colors.background };
  const getTodayDates = () => {
    const date1 = new Date();
    const date2 = new Date();
    date1.setHours(0, 0, 0, 0);
    date2.setHours(24, 0, 0, 0);
    return [date1, date2];
  };
  useEffect(() => {
    fetchUserSettings();
  }, []);

  useEffect(() => {
    if (userSettings?.statsForAssignedWorkOrders !== undefined)
      dispatch(getMobileOverviewStats(userSettings.statsForAssignedWorkOrders));
  }, [userSettings]);

  const onRefresh = () => {
    if (userSettings)
      dispatch(getMobileOverviewStats(userSettings.statsForAssignedWorkOrders));
  };
  const stats: { label: ExtendedWorkOrderStatus; value: number, filterFields: FilterField[] }[] = [{
    label: 'OPEN',
    value: mobileOverview.open,
    filterFields: [{
      field: 'status',
      operation: 'in',
      value: '',
      values: ['OPEN'],
      enumName: 'STATUS'
    }]
  }, {
    label: 'ON_HOLD',
    value: mobileOverview.onHold,
    filterFields: [{
      field: 'status',
      operation: 'in',
      value: '',
      values: ['ON_HOLD'],
      enumName: 'STATUS'
    }]
  }, {
    label: 'IN_PROGRESS',
    value: mobileOverview.inProgress,
    filterFields: [{
      field: 'status',
      operation: 'in',
      value: '',
      values: ['IN_PROGRESS'],
      enumName: 'STATUS'
    }]
  }, {
    label: 'COMPLETE', value: mobileOverview.complete,
    filterFields: [{
      field: 'status',
      operation: 'in',
      value: '',
      values: ['COMPLETE'],
      enumName: 'STATUS'
    }]
  },
    // {
    //   label: 'LATE_WO', value: 3,
    //   filterField: {
    //     field: 'dueDate',
    //     operation: 'ge',
    //     value: 'ON_HOLD'
    //   }
    // },
    {
      label: 'TODAY_WO', value: mobileOverview.today,
      filterFields: [{
        field: 'dueDate',
        operation: 'ge',
        value: getTodayDates()[0],
        enumName: 'JS_DATE'
      },
        {
          field: 'dueDate',
          operation: 'le',
          value: getTodayDates()[1],
          enumName: 'JS_DATE'
        }]
    },
    {
      label: 'HIGH_WO', value: mobileOverview.high,
      filterFields: [{
        field: 'priority',
        operation: 'in',
        value: '',
        values: ['HIGH'],
        enumName: 'PRIORITY'
      }]
    }];
  return (
    <ScrollView style={{ ...styles.container, backgroundColor: theme.colors.background }}
                refreshControl={
                  <RefreshControl refreshing={loading.mobileOverview}
                                  onRefresh={onRefresh} />}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <IconButton style={iconButtonStyle}
                    icon={'poll'} />
        <IconButton style={iconButtonStyle} icon={'bell'} />
        <IconButton style={iconButtonStyle} icon={'package-variant-closed'} />
      </View>
      <View
        style={{
          marginHorizontal: 10,
          marginTop: 20,
          paddingHorizontal: 10,
          paddingVertical: 5,
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderRadius: 10,
          alignItems: 'center'
        }}>
        <Text>{t('only_assigned_to_me')}</Text>
        <Switch value={userSettings?.statsForAssignedWorkOrders} onValueChange={(value) => {
          patchUserSettings({
            ...userSettings,
            statsForAssignedWorkOrders: value
          });
        }} />
      </View>
      {stats.map(stat => (
        <View
          key={stat.label}
          style={{
            marginHorizontal: 10,
            marginTop: 20,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10
          }}>
          <TouchableOpacity
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%'
            }}
            onPress={() => {
              if (userSettings) {
                const filterFields = stat.filterFields;
                if (userSettings.statsForAssignedWorkOrders) {
                  filterFields.push({
                    field: 'primaryUser',
                    operation: 'eq',
                    value: user.id
                  });
                }
                navigation.navigate('WorkOrders', { filterFields });
              }
            }}
          >
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center'
            }}>
              <View
                style={{ width: 2, height: 30, backgroundColor: getStatusColor(stat.label, theme) }}>{null}</View>
              <Text variant={'titleSmall'} style={{ fontWeight: 'bold', marginLeft: 10 }}>{t(stat.label)}</Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text>{stat.value}</Text>
              <IconButton icon={'arrow-right-bold-circle-outline'} />
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  iconButton: { width: 50, height: 50, borderRadius: 25 }
});
