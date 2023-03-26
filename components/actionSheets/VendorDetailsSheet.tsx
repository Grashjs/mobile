import { SheetProps } from 'react-native-actions-sheet';
import { useTheme } from 'react-native-paper';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import { Vendor } from '../../models/vendor';
import CustomActionSheet, {
  CustomActionSheetOption
} from './CustomActionSheet';

export default function VendorDetailsSheet(
  props: SheetProps<{
    onEdit: () => void;
    onDelete: () => void;
    vendor: Vendor;
  }>
) {
  const { t } = useTranslation();
  const { hasEditPermission, hasDeletePermission } = useAuth();
  const theme = useTheme();
  const options: CustomActionSheetOption[] = [
    {
      title: t('edit'),
      icon: 'pencil',
      onPress: props.payload.onEdit,
      visible: hasEditPermission(
        PermissionEntity.VENDORS_AND_CUSTOMERS,
        props.payload.vendor
      )
    },
    {
      title: t('to_delete'),
      icon: 'delete-outline',
      onPress: props.payload.onDelete,
      color: theme.colors.error,
      visible: hasDeletePermission(
        PermissionEntity.VENDORS_AND_CUSTOMERS,
        props.payload.vendor
      )
    }
  ];

  return <CustomActionSheet options={options} />;
}
