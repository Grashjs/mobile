import {
  Image,
  LogBox,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { View } from '../../components/Themed';
import EditScreenInfo from '../../components/EditScreenInfo';
import {
  RootStackParamList,
  RootStackScreenProps,
  RootTabScreenProps
} from '../../types';
import {
  ActivityIndicator,
  AnimatedFAB,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Provider,
  Text,
  useTheme,
  ProgressBar
} from 'react-native-paper';
import MultiSelect from 'react-native-multiple-select';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useRef, useState } from 'react';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import * as React from 'react';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import Tag from '../../components/Tag';
import { getPriorityColor } from '../../utils/overall';
import { PermissionEntity } from '../../models/role';
import useAuth from '../../hooks/useAuth';
import { controlTimer, getLabors } from '../../slices/labor';
import { useDispatch, useSelector } from '../../store';
import { durationToHours } from '../../utils/formatters';
import {
  editWOPartQuantities,
  getPartQuantitiesByWorkOrder
} from '../../slices/partQuantity';
import { getAdditionalCosts } from '../../slices/additionalCost';
import { getRelations } from '../../slices/relation';
import { getTasks } from '../../slices/task';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { date } from 'yup';
import { editWorkOrder } from '../../slices/workOrder';
import { PlanFeature } from '../../models/subscriptionPlan';
import PartQuantities from '../../components/PartQuantities';

export default function WODetailsScreen({
                                          navigation,
                                          route
                                        }: RootStackScreenProps<'WODetails'>) {
  const { id } = route.params;
  const { workOrders } = useSelector((state) => state.workOrders);
  const workOrder = workOrders.content.find((workOrder) => workOrder.id === id);
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
  const { getFormattedDate, getUserNameById, getFormattedCurrency } =
    useContext(CompanySettingsContext);
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [isExtended, setIsExtended] = React.useState(true);
  const statuses = ['OPEN', 'ON_HOLD', 'IN_PROGRESS', 'COMPLETE'].map(
    (status) => ({ key: status, value: t(status) })
  );
  const fieldsToRender: {
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
  const touchableFields: {
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
      headerRight: () => (
        <Pressable onPress={() => actionSheetRef.current.show()}>
          <IconButton icon='dots-vertical' />
        </Pressable>
      )
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
  const onScroll = ({ nativeEvent }) => {
    const currentScrollPosition =
      Math.floor(nativeEvent?.contentOffset?.y) ?? 0;

    setIsExtended(currentScrollPosition <= 0);
  };
  const onCompleteWO = (
    signatureId: number | undefined,
    feedback: string | undefined
  ): Promise<any> => {
    return dispatch(
      editWorkOrder(workOrder?.id, {
        ...workOrder,
        status: 'COMPLETE',
        feedback: feedback ?? null,
        signature: signatureId ? { id: signatureId } : null
      })
    ).then(() => navigation.navigate('Root'));
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
            navigation.navigate('CompleteWorkOrder', {
              onComplete: onCompleteWO,
              fieldsConfig: {
                feedback: generalPreferences.askFeedBackOnWOClosed,
                signature: workOrder.requiredSignature
              }
            });
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
    const options: {
      title: string;
      icon: IconSource;
      onPress: () => void;
      color?: string;
    }[] = [
      {
        title: t('edit'),
        icon: 'pencil',
        onPress: () => null
      },
      { title: t('to_export'), icon: 'download-outline', onPress: () => null },
      { title: t('archive'), icon: 'archive-outline', onPress: () => null },
      {
        title: t('to_delete'),
        icon: 'delete-outline',
        onPress: () => null,
        color: theme.colors.error
      }
    ];

    return (
      <ActionSheet ref={actionSheetRef}>
        <View style={{ padding: 15 }}>
          <Divider />
          <List.Section>
            {options.map((entity, index) => (
              <List.Item
                key={index}
                titleStyle={{ color: entity.color }}
                title={entity.title}
                left={() => (
                  <List.Icon icon={entity.icon} color={entity.color} />
                )}
                onPress={entity.onPress}
              />
            ))}
          </List.Section>
        </View>
      </ActionSheet>
    );
  };

  function ObjectField({
                         label,
                         value
                       }: {
    label: string;
    value: string | number;
  }) {
    if (value)
      return (
        <TouchableOpacity style={{ marginTop: 20 }}>
          <Text variant='titleMedium' style={{ fontWeight: 'bold' }}>
            {label}
          </Text>
          <Text variant='bodyLarge'>{value}</Text>
        </TouchableOpacity>
      );
    else return null;
  }

  function BasicField({
                        label,
                        value
                      }: {
    label: string;
    value: string | number;
  }) {
    if (value)
      return (
        <View key={label} style={{ marginTop: 20 }}>
          <Divider style={{ marginBottom: 20 }} />
          <Text variant='titleMedium' style={{ fontWeight: 'bold' }}>
            {label}
          </Text>
          <Text variant='bodyLarge'>{value}</Text>
        </View>
      );
    else return null;
  }

  return (
    <View style={styles.container}>
      <Provider theme={theme}>
        {loading && (
          <ActivityIndicator
            style={{
              position: 'absolute',
              top: '45%',
              left: '45%',
              zIndex: 10
            }}
            size='large'
          />
        )}
        {renderActionSheet()}
        <ScrollView
          onScroll={onScroll}
          style={{
            paddingHorizontal: 20
          }}
        >
          <Text variant='displaySmall'>{workOrder.title}</Text>
          <View style={styles.row}>
            <Text
              variant='titleMedium'
              style={{ marginRight: 10 }}
            >{`#${workOrder.id}`}</Text>
            <Tag
              text={t('priority_label', { priority: t(workOrder.priority) })}
              color='white'
              backgroundColor={getPriorityColor(workOrder.priority, theme)}
            />
          </View>
          {workOrder.image && (
            <View style={{ marginTop: 20 }}>
              <Image
                style={{ height: 200 }}
                source={{ uri: workOrder.image.url }}
              />
            </View>
          )}
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
            {fieldsToRender.map(
              ({ label, value }, index) =>
                value && <BasicField key={label} label={label} value={value} />
            )}
            {touchableFields.map(
              ({ label, value }) =>
                value && <ObjectField key={label} label={label} value={value} />
            )}
            {workOrder.primaryUser && (
              <ObjectField
                label={t('primary_worker')}
                value={getUserNameById(workOrder.primaryUser.id)}
              />
            )}
            {(workOrder.parentRequest || workOrder.createdBy) && (
              <ObjectField
                label={
                  workOrder.parentRequest ? t('approved_by') : t('created_by')
                }
                value={getUserNameById(workOrder.createdBy)}
              />
            )}
            {workOrder.parentPreventiveMaintenance && (
              <ObjectField
                label={t('preventive_maintenance')}
                value={workOrder.parentPreventiveMaintenance.name}
              />
            )}
            {workOrder.status === 'COMPLETE' && (
              <View>
                {workOrder.completedBy && (
                  <ObjectField
                    label={t('completed_by')}
                    value={`${workOrder.completedBy.firstName} ${workOrder.completedBy.lastName}`}
                  />
                )}
                <BasicField
                  label={t('completed_on')}
                  value={getFormattedDate(workOrder.completedOn)}
                />
                {workOrder.feedback && (
                  <BasicField
                    label={t('feedback')}
                    value={workOrder.feedback}
                  />
                )}
                {workOrder.signature && (
                  <View style={{ marginTop: 20 }}>
                    <Divider style={{ marginBottom: 20 }} />
                    <Text variant='titleMedium' style={{ fontWeight: 'bold' }}>
                      {t('signature')}
                    </Text>
                    <Image
                      source={{ uri: workOrder.signature.url }}
                      style={{ height: 200 }}
                    />
                  </View>
                )}
              </View>
            )}
            {workOrder.parentRequest && (
              <ObjectField
                label={t('requested_by')}
                value={getUserNameById(workOrder.parentRequest.createdBy)}
              />
            )}
            {!!workOrder.assignedTo.length && (
              <View style={{ marginTop: 20 }}>
                <Text variant='titleMedium' style={{ fontWeight: 'bold' }}>
                  {t('assigned_to')}
                </Text>
                {workOrder.assignedTo.map((user) => (
                  <TouchableOpacity key={user.id} style={{ marginTop: 5 }}>
                    <Text
                      variant='bodyLarge'
                      style={{ marginTop: 15 }}
                    >{`${user.firstName} ${user.lastName}`}</Text>
                  </TouchableOpacity>
                ))}
                {workOrder.customers.map((customer) => (
                  <TouchableOpacity key={customer.id} style={{ marginTop: 5 }}>
                    <Text variant='bodyLarge' style={{ marginTop: 15 }}>
                      {customer.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.shadowedCard}>
              <Text style={{ marginBottom: 10 }}>{t('parts')}</Text>
              <PartQuantities
                partQuantities={partQuantities}
                isPO={false}
                rootId={workOrder.id}
              />
              <Divider style={{ marginTop: 5 }} />
              <Button
                onPress={() =>
                  navigation.navigate('SelectParts', {
                    onChange: (selectedParts) => {
                      dispatch(
                        editWOPartQuantities(
                          workOrder.id,
                          selectedParts.map((part) => part.id)
                        )
                      );
                    },
                    selected: partQuantities.map(
                      (partQuantity) => partQuantity.part.id
                    )
                  })
                }
              >
                {t('add_parts')}
              </Button>
            </View>
            <View style={styles.shadowedCard}>
              <Text style={{ marginBottom: 10 }}>{t('additional_costs')}</Text>
              {!additionalCosts.length ? (
                <Text style={{ fontWeight: 'bold' }}>
                  {t('no_additional_cost')}
                </Text>
              ) : (
                <View>
                  {additionalCosts.map((cost) => (
                    <View
                      key={cost.id}
                      style={{ display: 'flex', flexDirection: 'column' }}
                    >
                      <Text style={{ fontWeight: 'bold' }}
                            variant='bodyLarge'>{cost.description}</Text>
                      <Text>{getFormattedCurrency(cost.cost)}</Text>
                    </View>
                  ))}
                  <Text style={{ fontWeight: 'bold' }}
                        variant='bodyLarge'>{t('total')}</Text>
                  <Text>
                    {getFormattedCurrency(
                      additionalCosts.reduce(
                        (acc, additionalCost) =>
                          additionalCost.includeToTotalCost
                            ? acc + additionalCost.cost
                            : acc,
                        0
                      )
                    )}
                  </Text>
                </View>
              )}
              <Divider style={{ marginTop: 5 }} />
              <Button
                onPress={() =>
                  navigation.navigate('SelectParts', {
                    onChange: (selectedParts) => {
                      dispatch(
                        editWOPartQuantities(
                          workOrder.id,
                          selectedParts.map((part) => part.id)
                        )
                      );
                    },
                    selected: partQuantities.map(
                      (partQuantity) => partQuantity.part.id
                    )
                  })
                }
              >
                {t('add_additional_cost')}
              </Button>
            </View>
            {!!tasks.length && <View style={styles.shadowedCard}>
              <Text style={{ marginBottom: 10 }}>{t('tasks')}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Tasks', { workOrderId: workOrder.id, tasksProps: tasks })}
              ><Text variant='titleLarge' style={{ fontWeight: 'bold' }}> {
                t('remaining_tasks', { count: tasks.filter(task => !task.value).length })}</Text>
                <Text
                  variant='bodyMedium'>{t('complete_tasks_percent', { percent: (tasks.filter(task => task.value).length * 100 / tasks.length).toFixed(0) })}</Text>
                <Divider style={{ marginTop: 5 }} />
                <ProgressBar progress={tasks.filter(task => task.value).length / tasks.length} />
              </TouchableOpacity>
            </View>}
          </View>
        </ScrollView>
        <AnimatedFAB
          icon={runningTimer ? 'stop' : 'play'}
          label={
            runningTimer
              ? t('stop_work_order')
              : t('start_work_order') +
              ' - ' +
              durationToHours(primaryTime?.duration)
          }
          disabled={
            controllingTime ||
            !hasEditPermission(PermissionEntity.WORK_ORDERS, workOrder)
          }
          theme={theme}
          variant={runningTimer ? 'primary' : 'secondary'}
          color='white'
          extended={isExtended}
          onPress={() => {
            setControllingTime(true);
            dispatch(controlTimer(!runningTimer, workOrder.id)).finally(() =>
              setControllingTime(false)
            );
          }}
          visible={true}
          animateFrom={'right'}
          style={[styles.fabStyle]}
        />
      </Provider>
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
  row: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
  shadowedCard: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    marginBottom: 10,
    elevation: 5
  },
  fabStyle: {
    bottom: 16,
    right: 16,
    position: 'absolute'
  }
});
