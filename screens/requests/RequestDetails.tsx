import { ScrollView, TouchableOpacity } from 'react-native';
import LoadingDialog from '../../components/LoadingDialog';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../store';
import { RootStackParamList, RootStackScreenProps } from '../../types';
import { ActivityIndicator, Button, Dialog, Divider, IconButton, Portal, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { View } from '../../components/Themed';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { approveRequest, cancelRequest, deleteRequest, getRequestDetails } from '../../slices/request';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import { PermissionEntity } from '../../models/role';
import useAuth from '../../hooks/useAuth';

export default function RequestDetails({ navigation, route }: RootStackScreenProps<'RequestDetails'>) {
  const { id } = route.params;
  const { loadingGet, requestInfos } = useSelector(state => state.requests);
  const request = requestInfos[id]?.request;
  const theme = useTheme();
  const [approving, setApproving] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { getFormattedDate, getUserNameById } = useContext(
    CompanySettingsContext
  );
  const {
    hasViewPermission,
    hasEditPermission,
    hasDeletePermission
  } = useAuth();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const onApprove = () => {
    setApproving(true);
    dispatch(approveRequest(request.id))
      .then((workOrderId: number) => {
        navigation.navigate('WODetails', { id: workOrderId });
      })
      .finally(() => setApproving(false));
  };

  const onCancel = () => {
    setCancelling(true);
    dispatch(cancelRequest(request.id))
      .then(() => navigation.goBack())
      .finally(() => setCancelling(false));
  };
  const fieldsToRender = [
    {
      label: t('description'),
      value: request?.description
    },
    {
      label: t('id'),
      value: request?.id
    },
    {
      label: t('priority'),
      value: t(`${request?.priority.toLowerCase()}_priority`)
    },
    {
      label: t('due_date'),
      value: getFormattedDate(request?.dueDate)
    },
    {
      label: t('category'),
      value: request?.category?.name
    }
  ];
  const onDeleteSuccess = () => {
    showSnackBar(t('request_delete_success'), 'success');
    navigation.goBack();
  };
  const onDeleteFailure = (err) =>
    showSnackBar(t('request_delete_failure'), 'error');

  const handleDelete = () => {
    dispatch(deleteRequest(request?.id)).then(onDeleteSuccess).catch(onDeleteFailure);
    setOpenDelete(false);
  };
  const renderConfirmDelete = () => {
    return (<Portal>
      <Dialog visible={openDelete} onDismiss={() => setOpenDelete(false)}>
        <Dialog.Title>{t('confirmation')}</Dialog.Title>
        <Dialog.Content>
          <Text variant='bodyMedium'>{t('confirm_delete_request')}</Text>
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
    dispatch(getRequestDetails(id));
  }, [route]);

  useEffect(() => {
    navigation.setOptions({
      title: request?.title ?? t('loading'),
      headerRight: () => (

        <View style={{ display: 'flex', flexDirection: 'row' }}>
          {hasDeletePermission(PermissionEntity.REQUESTS, request) &&
          <IconButton onPress={() => setOpenDelete(true)} icon='delete-outline' />}
          {!request?.workOrder &&
          !request?.cancelled &&
          hasEditPermission(PermissionEntity.REQUESTS, request) &&
          <IconButton icon={'pencil'} onPress={() => navigation.navigate('EditRequest', { request })} />}
          {approving ? <ActivityIndicator /> : !request?.workOrder &&
            !request?.cancelled &&
            hasViewPermission(PermissionEntity.SETTINGS) && <IconButton onPress={onApprove} icon='check' />}
        </View>
      )
    });
  }, [request, approving]);

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

  function ObjectField({
                         label,
                         value, link
                       }: {
    label: string;
    value: string | number;
    link: { route: keyof RootStackParamList; id: number }
  }) {
    if (value) {
      return (
        // @ts-ignore
        <TouchableOpacity onPress={() => navigation.navigate(link.route, { id: link.id })}
                          style={{ marginTop: 20, padding: 20, backgroundColor: 'white' }}>
          <Text variant='titleMedium' style={{ fontWeight: 'bold' }}>
            {label}
          </Text>
          <Text variant='bodyLarge'>{value}</Text>
        </TouchableOpacity>
      );
    } else return null;
  }

  if (request) return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {renderConfirmDelete()}
      {request.cancelled && (
        <BasicField label={t('status')} value={t('cancelled')} />
      )}
      {fieldsToRender.map(field => <BasicField key={field.label} label={field.label} value={field.value} />
      )}
      <ObjectField label={t('requested_by')} value={getUserNameById(request.createdBy)}
                   link={{ route: 'UserDetails', id: request.createdBy }} />
      {request.asset && <ObjectField label={t('asset')} value={request.asset.name}
                                     link={{ route: 'AssetDetails', id: request.asset.id }} />}
      {request.location && <ObjectField label={t('location')} value={request.location.name}
                                        link={{ route: 'LocationDetails', id: request.location.id }} />}
      {request.primaryUser && <ObjectField label={t('primary_worker')}
                                           value={`${request.primaryUser.firstName} ${request.primaryUser.lastName}`}
                                           link={{ route: 'UserDetails', id: request.primaryUser.id }} />}
      {request.team &&
      <ObjectField label={t('team')} value={request.team.name} link={{ route: 'TeamDetails', id: request.team.id }} />}
      {!request.workOrder &&
      !request.cancelled &&
      hasViewPermission(PermissionEntity.SETTINGS) && (
        <Button disabled={cancelling} loading={cancelling} onPress={onCancel} mode='contained' style={{ margin: 20 }}
                buttonColor={theme.colors.error}>{t('reject')}</Button>)}
    </ScrollView>
  );
  else return (
    <LoadingDialog visible={loadingGet} />
  );
}
