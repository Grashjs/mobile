import { Pressable, ScrollView } from 'react-native';
import LoadingDialog from '../../components/LoadingDialog';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../store';
import { RootStackScreenProps } from '../../types';
import { Button, Dialog, Divider, IconButton, Portal, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { View } from '../../components/Themed';
import ListField from '../../components/ListField';
import { UserMiniDTO } from '../../models/user';
import { getUserUrl } from '../../utils/urlPaths';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { deleteMeter, getMeterDetails } from '../../slices/meter';
import { getWorkOrderMeterTriggers } from '../../slices/workOrderMeterTrigger';
import { getReadings } from '../../slices/reading';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import { SheetManager } from 'react-native-actions-sheet';

export default function MeterDetails({ navigation, route }: RootStackScreenProps<'MeterDetails'>) {
  const { id } = route.params;
  const { loadingGet, meterInfos } = useSelector(state => state.meters);
  const { readingsByMeter } = useSelector((state) => state.readings);
  const { metersTriggers } = useSelector(
    (state) => state.workOrderMeterTriggers
  );
  const currentMeterTriggers = metersTriggers[id] ?? [];
  const currentMeterReadings = readingsByMeter[id] ?? [];
  const meter = meterInfos[id]?.meter;
  const theme = useTheme();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { getFormattedDate } = useContext(
    CompanySettingsContext
  );
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const fieldsToRender = [
    {
      label: t('location_name'),
      value: meter?.location?.name
    },
    {
      label: t('asset_name'),
      value: meter?.asset?.name
    },
    {
      label: t('reading_frequency'),
      value: t('every_frequency_days', { frequency: meter?.updateFrequency })
    }
  ];
  const onDeleteSuccess = () => {
    showSnackBar(t('meter_delete_success'), 'success');
    navigation.goBack();
  };
  const onDeleteFailure = (err) =>
    showSnackBar(t('meter_delete_failure'), 'error');

  const handleDelete = () => {
    dispatch(deleteMeter(meter?.id)).then(onDeleteSuccess).catch(onDeleteFailure);
    setOpenDelete(false);
  };
  const renderConfirmDelete = () => {
    return (<Portal>
      <Dialog visible={openDelete} onDismiss={() => setOpenDelete(false)}>
        <Dialog.Title>{t('confirmation')}</Dialog.Title>
        <Dialog.Content>
          <Text variant='bodyMedium'>{t('confirm_delete_meter')}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setOpenDelete(false)}>{t('cancel')}</Button>
          <Button onPress={handleDelete}>{t('to_delete')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>);
  };

  useEffect(() => {
    const { id } = route.params;
    dispatch(getMeterDetails(id));
    dispatch(getWorkOrderMeterTriggers(id));
    dispatch(getReadings(id));
  }, [route]);

  useEffect(() => {
    navigation.setOptions({
      title: meter?.name ?? t('loading'),
      headerRight: () => (
        <Pressable onPress={() => {
          SheetManager.show('meter-details-sheet', {
            payload: {
              onEdit: () => navigation.navigate('EditMeter', { meter }),
              onDelete: () => setOpenDelete(true)
            }
          });
        }}>
          <IconButton icon='dots-vertical' />
        </Pressable>
      )
    });
  }, [meter]);

  function BasicField({
                        label,
                        value
                      }: {
    label: string;
    value: string | number;
  }) {
    if (value)
      return (
        <View>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
            <Text>{label}</Text>
            <Text style={{ fontWeight: 'bold' }}>{value}</Text>
          </View>
          <Divider />
        </View>
      );
    else return null;
  }

  if (meter) return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {renderConfirmDelete()}
      {fieldsToRender.map(field => <BasicField key={field.label} label={field.label} value={field.value} />
      )}
      <ListField
        values={meter?.users}
        label={t('assigned_to')}
        getHref={(user: UserMiniDTO) => getUserUrl(user.id)}
        getValueLabel={(user: UserMiniDTO) =>
          `${user.firstName} ${user.lastName}`
        }
      />
      {!!currentMeterTriggers.length &&
      <Text variant={'titleMedium'} style={{ color: theme.colors.primary, padding: 20 }}>{t('wo_triggers')}</Text>}
      {currentMeterTriggers.map(trigger => (
        <View style={{ padding: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>{trigger.name}</Text>
          <Text>{`${trigger.triggerCondition === 'MORE_THAN'
            ? t('greater_than')
            : t('lower_than')} ${trigger.value} ${meter.unit}`}</Text>
        </View>
      ))}
      <Text variant={'titleMedium'} style={{ color: theme.colors.primary, padding: 20 }}>{t('reading_history')}</Text>
      {[...currentMeterReadings].reverse().map(reading => (
        <BasicField label={getFormattedDate(reading.createdAt)} value={`${reading.value} ${meter.unit}`} />
      ))}
    </ScrollView>
  );
  else return (
    <LoadingDialog visible={loadingGet} />
  );
}
