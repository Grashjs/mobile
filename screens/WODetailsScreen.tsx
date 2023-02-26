import { Image, Pressable, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from '../components/Themed';
import EditScreenInfo from '../components/EditScreenInfo';
import { RootStackParamList, RootStackScreenProps, RootTabScreenProps } from '../types';
import { Button, Card, Divider, IconButton, List, Text, useTheme } from 'react-native-paper';
import { SelectList } from 'react-native-dropdown-select-list';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useRef, useState } from 'react';
import { CompanySettingsContext } from '../contexts/CompanySettingsContext';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import * as React from 'react';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import Tag from '../components/Tag';
import { getPriorityColor } from '../utils/overall';
import { PermissionEntity } from '../models/role';
import useAuth from '../hooks/useAuth';
import { controlTimer, getLabors } from '../slices/labor';
import { useDispatch, useSelector } from '../store';
import { durationToHours } from '../utils/formatters';


export default function WODetailsScreen({ navigation, route }: RootStackScreenProps<'WODetails'>) {
  const { workOrder } = route.params;
  const { t } = useTranslation();
  const { hasEditPermission, user } = useAuth();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { timesByWorkOrder } = useSelector((state) => state.labors);
  const labors = timesByWorkOrder[workOrder.id] ?? [];
  const primaryTime = labors.find(
    (labor) => labor.logged && labor.assignedTo.id === user.id
  );
  const runningTimer = primaryTime?.status === 'RUNNING';
  const [controllingTime, setControllingTime] = useState<boolean>(false);
  const { getFormattedDate, getUserNameById } = useContext(CompanySettingsContext);
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const statuses = ['OPEN', 'ON_HOLD', 'IN_PROGRESS', 'COMPLETE'].map(status => ({ key: status, value: t(status) }));
  const fieldsToRender:
    {
      label: string;
      value: string | number;
    }[] = [
    {
      label: t('description'),
      value: workOrder.description
    },
    {
      label: t('due_date'),
      value: getFormattedDate(workOrder.dueDate)
    },
    {
      label: t('category'),
      value: workOrder.category?.name
    },
    {
      label: t('created_at'),
      value: getFormattedDate(workOrder.createdAt)
    }
  ];
  const touchableFields:
    {
      label: string;
      value: string | number;
    }[] = [
    {
      label: t('asset'),
      value: workOrder.asset?.name
    },
    {
      label: t('location'),
      value: workOrder.location?.name
    },
    {
      label: t('team'),
      value: workOrder.team?.name
    }
  ];
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <Pressable onPress={() => actionSheetRef.current.show()}><IconButton
        icon='dots-vertical' /></Pressable>
    });
    dispatch(getLabors(workOrder.id));
  }, []);
  const renderActionSheet = () => {
    const options: { title: string; icon: IconSource; onPress: () => void; color?: string }[] = [{
      title: t('edit'),
      icon: 'pencil',
      onPress: () => null
    },
      { title: t('to_export'), icon: 'download-outline', onPress: () => null },
      { title: t('archive'), icon: 'archive-outline', onPress: () => null },
      { title: t('to_delete'), icon: 'delete-outline', onPress: () => null, color: theme.colors.error }
    ];

    return (<ActionSheet ref={actionSheetRef}>
      <View style={{ padding: 15 }}>
        <Divider />
        <List.Section>
          {options.map((entity, index) => <List.Item key={index} titleStyle={{ color: entity.color }}
                                                     title={entity.title}
                                                     left={() => <List.Icon icon={entity.icon} color={entity.color} />}
                                                     onPress={entity.onPress} />)}
        </List.Section>
      </View>
    </ActionSheet>);
  };

  function ObjectField({ label, value }: { label: string; value: string | number }) {
    return (<TouchableOpacity style={{ marginTop: 20 }}>
      < Text variant='titleMedium'
             style={{ fontWeight: 'bold' }}>{label}</Text>
      <Text variant='bodyLarge'>{value}</Text>
    </TouchableOpacity>);
  }

  function BasicField({ label, value }: { label: string; value: string | number }) {
    return (<View key={label} style={{ marginTop: 20 }}><Divider style={{ marginBottom: 20 }} />
      <Text variant='titleMedium'
            style={{ fontWeight: 'bold' }}>{label}</Text>
      <Text variant='bodyLarge'>{value}</Text>
    </View>);
  }

  return (
    <View style={styles.container}>
      {renderActionSheet()}
      <ScrollView style={{
        padding: 20
      }}>
        <Text variant='displaySmall'>{workOrder.title}</Text>
        <View style={styles.row}>
          <Text variant='titleMedium' style={{ marginRight: 10 }}>{`#${workOrder.id}`}</Text>
          <Tag text={t('priority_label', { priority: t(workOrder.priority) })} color='white'
               backgroundColor={getPriorityColor(workOrder.priority, theme)} />
        </View>
        {workOrder.image && <View style={{ marginTop: 20 }}>
          <Image style={{ height: 200 }}
                 source={{ uri: workOrder.image.url }} />
        </View>}
        <View style={{ marginTop: 20 }}>
          <SelectList
            searchPlaceholder={t('search')}
            setSelected={(status) => workOrder.status}
            defaultOption={{ key: workOrder.status, value: t(workOrder.status) }}
            data={statuses} />
          {fieldsToRender.map(({ label, value }, index) => (
            value && <BasicField key={label} label={label} value={value} />
          ))
          }
          {touchableFields.map(({ label, value }) => value && <ObjectField label={label} value={value} />)}
          {workOrder.primaryUser &&
          <ObjectField label={t('primary_worker')} value={getUserNameById(workOrder.primaryUser.id)} />}
          {(workOrder.parentRequest || workOrder.createdBy) && <ObjectField label={workOrder.parentRequest
            ? t('approved_by')
            : t('created_by')} value={getUserNameById(workOrder.createdBy)} />}
          {workOrder.parentPreventiveMaintenance &&
          <ObjectField label={t('preventive_maintenance')} value={workOrder.parentPreventiveMaintenance.name} />}
          {workOrder.status === 'COMPLETE' && <View>
            {workOrder.completedBy && <ObjectField label={t('completed_by')}
                                                   value={`${workOrder.completedBy.firstName} ${workOrder.completedBy.lastName}`} />}
            <BasicField label={t('completed_on')} value={getFormattedDate(workOrder.completedOn)} />
            {workOrder.feedback && <BasicField label={t('feedback')} value={workOrder.feedback} />}
            {workOrder.signature && <View style={{ marginTop: 20 }}><Divider style={{ marginBottom: 20 }} />
              <Text variant='titleMedium'
                    style={{ fontWeight: 'bold' }}>{t('signature')}</Text>
              <Image source={{ uri: workOrder.signature.url }} style={{ height: 200 }} />
            </View>}
          </View>}
          {workOrder.parentRequest &&
          <ObjectField label={t('requested_by')} value={getUserNameById(workOrder.parentRequest.createdBy)} />}
          {!!workOrder.assignedTo.length && <View style={{ marginTop: 20 }}>
            < Text variant='titleMedium'
                   style={{ fontWeight: 'bold' }}>{t('assigned_to')}</Text>
            {workOrder.assignedTo.map(user => (<TouchableOpacity style={{ marginTop: 5 }}>
              <Text variant='bodyLarge' style={{ marginTop: 15 }}>{`${user.firstName} ${user.lastName}`}</Text>
            </TouchableOpacity>))}
            {workOrder.customers.map(customer => (<TouchableOpacity style={{ marginTop: 5 }}>
              <Text variant='bodyLarge' style={{ marginTop: 15 }}>{customer.name}</Text>
            </TouchableOpacity>))}
          </View>}
        </View>
      </ScrollView>
      <Button disabled={
        controllingTime ||
        !hasEditPermission(
          PermissionEntity.WORK_ORDERS,
          workOrder
        )
      }
              loading={controllingTime}
              onPress={() => {
                setControllingTime(true);
                dispatch(
                  controlTimer(!runningTimer, workOrder.id)
                ).finally(() => setControllingTime(false));
              }} style={styles.startButton}
              mode={runningTimer ? 'contained' : 'outlined'}>{runningTimer
        ? t('stop_work_order')
        : t('start_work_order') +
        ' - ' +
        durationToHours(primaryTime?.duration)}</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  },
  startButton: { position: 'absolute', bottom: 20, right: '10%' },
  row: { display: 'flex', flexDirection: 'row', alignItems: 'center' }
});
