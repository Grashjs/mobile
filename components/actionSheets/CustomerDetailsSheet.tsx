import { SheetProps } from 'react-native-actions-sheet';
import { useTheme } from 'react-native-paper';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { Customer } from '../../models/customer';
import { PermissionEntity } from '../../models/role';
import CustomActionSheet, {
  CustomActionSheetOption
} from './CustomActionSheet';

export default function CustomerDetailsSheet(
  props: SheetProps<{
    onEdit: () => void;
    onDelete: () => void;
    customer: Customer;
  }>
) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { hasEditPermission, hasDeletePermission } = useAuth();
  const options: CustomActionSheetOption[] = [
    {
      title: t('edit'),
      icon: 'pencil',
      onPress: props.payload.onEdit,
      visible: hasEditPermission(
        PermissionEntity.VENDORS_AND_CUSTOMERS,
        props.payload.customer
      )
    },
    {
      title: t('to_delete'),
      icon: 'delete-outline',
      onPress: props.payload.onDelete,
      color: theme.colors.error,
      visible: hasDeletePermission(
        PermissionEntity.VENDORS_AND_CUSTOMERS,
        props.payload.customer
      )
    }
  ];

  return <CustomActionSheet options={options} />;
}
