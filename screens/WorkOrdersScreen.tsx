import { ScrollView, StyleSheet, View } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { useDispatch, useSelector } from '../store';
import { useContext, useEffect, useState } from 'react';
import { CompanySettingsContext } from '../contexts/CompanySettingsContext';
import useAuth from '../hooks/useAuth';
import { PermissionEntity } from '../models/role';
import { getMoreWorkOrders, getWorkOrders } from '../slices/workOrder';
import { SearchCriteria } from '../models/page';
import { ActivityIndicator, Button, Card, Chip, IconButton, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Priority } from '../models/workOrder';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import * as React from 'react';

function Tag({ text, backgroundColor, color }: { text: string, color: string; backgroundColor: string }) {
  return (<View style={{ backgroundColor, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 5 }}><Text
    style={{ color }}>{text}</Text></View>);
}

function IconWithLabel({ icon, label }: { icon: IconSource, label: string }) {
  return (
    <View style={{ ...styles.row, justifyContent: 'flex-start' }}>
      <IconButton icon={icon} size={20} />
      <Text variant={'bodyMedium'}>{label}</Text>
    </View>
  );
}

export default function WorkOrdersScreen() {
  const { t } = useTranslation();
  const { workOrders, loadingGet, currentPageNum, lastPage } = useSelector(
    (state) => state.workOrders
  );
  const theme = useTheme();
  const { loadingExport } = useSelector((state) => state.exports);
  const dispatch = useDispatch();
  const { uploadFiles, getWOFieldsAndShapes } = useContext(
    CompanySettingsContext
  );
  const { getFormattedDate, getUserNameById } = useContext(
    CompanySettingsContext
  );
  const {
    hasViewPermission,
    hasViewOtherPermission,
    hasCreatePermission,
    hasFeature
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
        return '#9DA1A1';
      case 'IN_PROGRESS':
        return theme.colors.success;
      case 'ON_HOLD':
        return theme.colors.warning;
      case 'COMPLETE':
        return 'black';
    }
  };
  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'NONE':
        return '#9DA1A1';
      case 'LOW':
        return theme.colors.info;
      case 'MEDIUM':
        return theme.colors.warning;
      case 'HIGH':
        return theme.colors.error;
    }
  };
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
  return (
    <View style={styles.container}>
      {loadingGet &&
      <ActivityIndicator style={{ position: 'absolute', top: '45%', left: '45%', zIndex: 10 }} size='large' />}
      <ScrollView style={styles.scrollView}
                  onScroll={({ nativeEvent }) => {
                    if (isCloseToBottom(nativeEvent)) {
                      if (!loadingGet && !lastPage)
                        dispatch(getMoreWorkOrders(criteria, currentPageNum + 1));
                    }
                  }}
                  scrollEventThrottle={400}>
        {workOrders.content.map(workOrder => (
          <Card style={{ padding: 5, marginVertical: 5 }} key={workOrder.id}>
            <Card.Content>
              <View style={{ ...styles.row, justifyContent: 'space-between' }}>
                <Tag text={t(workOrder.status)} color='white' backgroundColor={getStatusColor(workOrder.status)} />
                <View style={{ ...styles.row, justifyContent: 'space-between' }}>
                  <View style={{ marginRight: 10 }}>
                    <Tag text={`#${workOrder.id}`} color='white' backgroundColor='#545454' />
                  </View>
                  <Tag text={t(workOrder.priority)} color='white'
                       backgroundColor={getPriorityColor(workOrder.priority)} />
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
