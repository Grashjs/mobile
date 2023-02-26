import { ScrollView, StyleSheet, View } from 'react-native';

import debounce from 'lodash.debounce';
import { useDispatch, useSelector } from '../../store';
import { useContext, useEffect, useMemo, useState } from 'react';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import { getMoreWorkOrders, getWorkOrders } from '../../slices/workOrder';
import { SearchCriteria } from '../../models/page';
import { ActivityIndicator, Button, Card, Chip, IconButton, MD3Theme, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import WorkOrder, { Priority } from '../../models/workOrder';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import * as React from 'react';
import { Searchbar } from 'react-native-paper';
import { getPriorityColor, onSearchQueryChange } from '../../utils/overall';
import { AuthStackScreenProps, RootStackScreenProps, RootTabScreenProps } from '../../types';
import Tag from '../../components/Tag';

function IconWithLabel({ icon, label }: { icon: IconSource, label: string }) {
  return (
    <View style={{ ...styles.row, justifyContent: 'flex-start' }}>
      <IconButton icon={icon} size={20} />
      <Text variant={'bodyMedium'}>{label}</Text>
    </View>
  );
}

export default function WorkOrdersScreen({ navigation }: RootTabScreenProps<'WorkOrders'>) {
  const { t } = useTranslation();
  const { workOrders, loadingGet, currentPageNum, lastPage } = useSelector(
    (state) => state.workOrders
  );
  const theme = useTheme();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const { getFormattedDate, getUserNameById } = useContext(
    CompanySettingsContext
  );
  const {
    hasViewPermission
  } = useAuth();
  const initialCriteria: SearchCriteria = {
    filterFields: [
      {
        field: 'priority',
        operation: 'in',
        values: ['NONE', 'LOW', 'MEDIUM', 'HIGH'],
        value: '',
        enumName: 'PRIORITY'
      },
      {
        field: 'status',
        operation: 'in',
        values: ['OPEN', 'IN_PROGRESS', 'ON_HOLD'],
        value: '',
        enumName: 'STATUS'
      },
      {
        field: 'archived',
        operation: 'eq',
        value: false
      }
    ],
    pageSize: 10,
    pageNum: 0,
    direction: 'DESC'
  };
  const [criteria, setCriteria] = useState<SearchCriteria>(initialCriteria);
  useEffect(() => {
    if (hasViewPermission(PermissionEntity.WORK_ORDERS))
      dispatch(getWorkOrders(criteria));
  }, [criteria]);

  const getStatusColor = (status): string => {
    switch (status) {
      case 'OPEN':
        return theme.colors.tertiary;
      case 'IN_PROGRESS':
        // @ts-ignore
        return theme.colors.success;
      case 'ON_HOLD':
        // @ts-ignore
        return theme.colors.warning;
      case 'COMPLETE':
        return 'black';
    }
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
  const onQueryChange = (query) => {
    onSearchQueryChange<WorkOrder>(query, criteria, setCriteria, setSearchQuery, [
      'title',
      'description',
      'feedback'
    ]);
  };

  return (
    <View style={styles.container}>
      {loadingGet &&
      <ActivityIndicator style={{ position: 'absolute', top: '45%', left: '45%', zIndex: 10 }} size='large' />}
      <Searchbar
        placeholder={t('search')}
        onChangeText={onQueryChange}
        value={searchQuery}
      />
      <ScrollView style={styles.scrollView}
                  onScroll={({ nativeEvent }) => {
                    if (isCloseToBottom(nativeEvent)) {
                      if (!loadingGet && !lastPage)
                        dispatch(getMoreWorkOrders(criteria, currentPageNum + 1));
                    }
                  }}
                  scrollEventThrottle={400}>
        {workOrders.content.map(workOrder => (
          <Card style={{ padding: 5, marginVertical: 5 }} key={workOrder.id}
                onPress={() => navigation.navigate('WODetails', { id: workOrder.id })}>
            <Card.Content>
              <View style={{ ...styles.row, justifyContent: 'space-between' }}>
                <Tag text={t(workOrder.status)} color='white' backgroundColor={getStatusColor(workOrder.status)} />
                <View style={{ ...styles.row, justifyContent: 'space-between' }}>
                  <View style={{ marginRight: 10 }}>
                    <Tag text={`#${workOrder.id}`} color='white' backgroundColor='#545454' />
                  </View>
                  <Tag text={t(workOrder.priority)} color='white'
                       backgroundColor={getPriorityColor(workOrder.priority, theme)} />
                </View>
              </View>
              <Text variant='titleMedium'>{workOrder.title}</Text>
              {workOrder.dueDate &&
              <IconWithLabel label={getFormattedDate(workOrder.dueDate)} icon='clock-alert-outline' />}
              {workOrder.asset && <IconWithLabel label={workOrder.asset.name} icon='package-variant-closed' />}
              {workOrder.location && <IconWithLabel label={workOrder.location.name} icon='map-marker-outline' />}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  scrollView: {
    width: '100%',
    height: '100%',
    padding: 5
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
});
