import { Image, LogBox, Pressable, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from '../components/Themed';
import EditScreenInfo from '../components/EditScreenInfo';
import { RootStackParamList, RootStackScreenProps, RootTabScreenProps } from '../types';
import { ActivityIndicator, Button, Card, Divider, IconButton, List, Text, useTheme } from 'react-native-paper';
import MultiSelect from 'react-native-multiple-select';
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
import { getPartQuantitiesByWorkOrder } from '../slices/partQuantity';
import { getAdditionalCosts } from '../slices/additionalCost';
import { getRelations } from '../slices/relation';
import { getTasks } from '../slices/task';
import { CustomSnackBarContext } from '../contexts/CustomSnackBarContext';
import { date } from 'yup';
import { editWorkOrder } from '../slices/workOrder';
import { PlanFeature } from '../models/subscriptionPlan';


export default function WODetailsScreen({ navigation, route }: RootStackScreenProps<'WODetails'>) {
  const { id } = route.params;
  const { workOrders } = useSelector((state) => state.workOrders);
  const workOrder = workOrders.content.find(workOrder => workOrder.id === id);
  const { t } = useTranslation();
  const { hasEditPermission, user, companySettings, hasFeature } = useAuth();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { workOrderConfiguration, generalPreferences } = companySettings;
  const [loading, setLoading] = useState<boolean>(false);
  const theme = useTheme();
  const dispatch = useDispatch();
  const { partQuantitiesByWorkOrder } = useSelector(
    (state) => state.partQuantities
  );
  const partQuantities = partQuantitiesByWorkOrder[workOrder.id] ?? [];
  const { workOrderHistories } = useSelector(
    (state) => state.workOrderHistories
  );
  const { relationsByWorkOrder } = useSelector((state) => state.relations);
  const { tasksByWorkOrder } = useSelector((state) => state.tasks);
  const tasks = tasksByWorkOrder[workOrder.id] ?? [];
  const currentWorkOrderHistories = workOrderHistories[workOrder.id] ?? [];
  const currentWorkOrderRelations = relationsByWorkOrder[workOrder.id] ?? [];
  const { costsByWorkOrder } = useSelector((state) => state.additionalCosts);

  const { timesByWorkOrder } = useSelector((state) => state.labors);
  const labors = timesByWorkOrder[workOrder.id] ?? [];
  const primaryTime = labors.find(
    (labor) => labor.logged && labor.assignedTo.id === user.id
  );
  const additionalCosts = costsByWorkOrder[workOrder.id] ?? [];
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
    dispatch(getPartQuantitiesByWorkOrder(workOrder.id));
    dispatch(getLabors(workOrder.id));
    dispatch(getAdditionalCosts(workOrder.id));
    dispatch(getTasks(workOrder.id));
    dispatch(getRelations(workOrder.id));
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
  }, []);

  const canComplete = (): boolean => {
    let error;
    const fieldsToTest = [
      {
        name: 'completeFiles',
        condition: !workOrder.files.length,
        message: 'required_files_on_completion'
      },
      {
        name: 'completeTasks',
        condition: tasks.some((task) => !task.value),
        message: 'required_tasks_on_completion'
      },
      {
        name: 'completeTime',
        condition: labors
          .filter((labor) => labor.logged)
          .some((labor) => !labor.duration),
        message: 'required_labor_on_completion'
      },
      {
        name: 'completeParts',
        condition: !partQuantities.length,
        message: 'required_part_on_completion'
      },
      {
        name: 'completeCost',
        condition: !additionalCosts.length,
        message: 'required_cost_on_completion'
      }
    ];
    fieldsToTest.every((field) => {
      const fieldConfig =
        workOrderConfiguration.workOrderFieldConfigurations.find(
          (woFC) => woFC.fieldName === field.name
        );
      if (fieldConfig.fieldType === 'REQUIRED' && field.condition) {
        showSnackBar(t(field.message), 'error');
        error = true;
        return false;
      }
      return true;
    });

    return !error;
  };
  const onStatusChange = (status: string) => {

    if (status === 'COMPLETE') {
      if (canComplete()) {
        if (
          generalPreferences.askFeedBackOnWOClosed ||
          workOrder.requiredSignature
        ) {
          let error;
          if (workOrder.requiredSignature) {
            if (!hasFeature(PlanFeature.SIGNATURE)) {
              error =
                'Signature on Work Order completion is not available in your current subscription plan.';
            }
          }
          if (error) {
            showSnackBar(t(error), 'error');
          } else {
            //TODO
            //setOpenCompleteModal(true);
            return;
          }
        }
      } else return;
    }
    setLoading(true);
    dispatch(
      editWorkOrder(workOrder?.id, {
        ...workOrder,
        status
      })
    ).finally(() => setLoading(false));
  };
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
      {loading &&
      <ActivityIndicator style={{ position: 'absolute', top: '45%', left: '45%', zIndex: 10 }} size='large' />}
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
          <MultiSelect
            hideTags
            items={statuses}
            uniqueKey='key'
            onSelectedItemsChange={(items) => {
              onStatusChange(items[0]);
            }}
            selectedItems={[workOrder.status]}
            selectText={t('select_status')}
            searchInputPlaceholderText={t('search')}
            displayKey='value'
            searchInputStyle={{ color: '#CCC' }}
            submitButtonColor={theme.colors.primary}
            single
            submitButtonText={t('submit')}
          />
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
