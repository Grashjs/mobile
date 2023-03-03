import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import { IconButton, useTheme, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ExtendedWorkOrderStatus, getStatusColor } from '../utils/overall';
import { FilterField } from '../models/page';

export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {
  const theme = useTheme();
  const { t } = useTranslation();
  const iconButtonStyle = { ...styles.iconButton, backgroundColor: theme.colors.background };
  const getTodayDates = () => {
    const date1 = new Date();
    const date2 = new Date();
    date1.setHours(0, 0, 0, 0);
    date2.setHours(24, 0, 0, 0);
    return [date1, date2];
  };
  const stats: { label: ExtendedWorkOrderStatus; value: number, filterFields: FilterField[] }[] = [{
    label: 'OPEN',
    value: 5,
    filterFields: [{
      field: 'status',
      operation: 'in',
      value: '',
      values: ['OPEN'],
      enumName: 'STATUS'
    }]
  }, {
    label: 'ON_HOLD',
    value: 2,
    filterFields: [{
      field: 'status',
      operation: 'in',
      value: '',
      values: ['ON_HOLD'],
      enumName: 'STATUS'
    }]
  }, {
    label: 'IN_PROGRESS',
    value: 5,
    filterFields: [{
      field: 'status',
      operation: 'in',
      value: '',
      values: ['IN_PROGRESS'],
      enumName: 'STATUS'
    }]
  }, {
    label: 'COMPLETE', value: 2,
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
      label: 'TODAY_WO', value: 5,
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
      label: 'HIGH_WO', value: 4,
      filterFields: [{
        field: 'priority',
        operation: 'in',
        value: '',
        values: ['HIGH'],
        enumName: 'PRIORITY'
      }]
    }];
  return (
    <ScrollView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <IconButton style={iconButtonStyle}
                    icon={'poll'} />
        <IconButton style={iconButtonStyle} icon={'bell'} />
        <IconButton style={iconButtonStyle} icon={'package-variant-closed'} />
      </View>
      {stats.map(stat => (
        <View
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
            onPress={() => navigation.navigate('WorkOrders', { filterFields: stat.filterFields })}
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
