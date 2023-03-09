import { Linking, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { RootStackScreenProps } from '../../../types';
import { useDispatch, useSelector } from '../../../store';
import { View } from '../../../components/Themed';
import { Button, Dialog, Divider, IconButton, Portal, Text, useTheme } from 'react-native-paper';
import LoadingDialog from '../../../components/LoadingDialog';
import { useContext, useEffect, useState } from 'react';
import { deleteVendor, getVendorDetails } from '../../../slices/vendor';
import { SheetManager } from 'react-native-actions-sheet';
import { deletePart } from '../../../slices/part';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';

export default function VendorDetailsScreen({ navigation, route }: RootStackScreenProps<'VendorDetails'>) {
  const { id } = route.params;
  const { vendorInfos, loadingGet } = useSelector((state) => state.vendors);
  const vendor = vendorInfos[id]?.vendor;
  const theme = useTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { getFormattedCurrency } = useContext(CompanySettingsContext);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  useEffect(() => {
    dispatch(getVendorDetails(route.params.id));
  }, [route]);

  useEffect(() => {
    navigation.setOptions({
      title: vendor?.name ?? t('loading'),
      headerRight: () => (
        <Pressable onPress={() => {
          SheetManager.show('vendor-details-sheet', {
            payload: {
              onEdit: () => navigation.navigate('EditVendor', { vendor }),
              onDelete: () => setOpenDelete(true)
            }
          });
        }}>
          <IconButton icon='dots-vertical' />
        </Pressable>
      )
    });
  }, [vendor]);
  const fieldsToRender: { label: string; value: string }[] = [
    {
      label: t('address'),
      value: vendor?.address
    },
    {
      label: t('phone'),
      value: vendor?.phone
    },
    {
      label: t('email'),
      value: vendor?.email
    },
    {
      label: t('type'),
      value: vendor?.vendorType
    },
    {
      label: t('hourly_rate'),
      value: !!vendor?.rate ? getFormattedCurrency(vendor.rate) : null
    }
  ];

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

  const onDeleteSuccess = () => {
    showSnackBar(t('vendor_delete_success'), 'success');
    navigation.goBack();
  };
  const onDeleteFailure = (err) =>
    showSnackBar(t('vendor_delete_failure'), 'error');

  const handleDelete = () => {
    dispatch(deleteVendor(vendor?.id)).then(onDeleteSuccess).catch(onDeleteFailure);
    setOpenDelete(false);
  };
  const renderConfirmDelete = () => {
    return (<Portal>
      <Dialog visible={openDelete} onDismiss={() => setOpenDelete(false)}>
        <Dialog.Title>{t('confirmation')}</Dialog.Title>
        <Dialog.Content>
          <Text variant='bodyMedium'>{t('confirm_delete_vendor')}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setOpenDelete(false)}>{t('cancel')}</Button>
          <Button onPress={handleDelete}>{t('to_delete')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>);
  };
  if (vendor) return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {renderConfirmDelete()}
      {fieldsToRender.map(
        ({ label, value }, index) =>
          value && <BasicField key={label} label={label} value={value} />
      )}
      {vendor.website && (
        <View>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
            <Text>{t('website')}</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(vendor.website.startsWith('https://') ? vendor.website : 'https://' + vendor.website)}>
              <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{vendor.website}</Text>
            </TouchableOpacity>
          </View>
          <Divider />
        </View>
      )}
    </ScrollView>
  );
  else return (
    <LoadingDialog visible={loadingGet} />
  );
}