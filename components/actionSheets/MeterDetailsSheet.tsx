import { SheetProps } from 'react-native-actions-sheet';
import { useTheme } from 'react-native-paper';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import Meter from '../../models/meter';
import CustomActionSheet, {
  CustomActionSheetOption
} from './CustomActionSheet';

export default function MeterDetailsSheet(
  props: SheetProps<{ onEdit: () => void; onDelete: () => void; meter: Meter }>
) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { hasEditPermission, hasDeletePermission } = useAuth();
  const options: CustomActionSheetOption[] = [
    {
      title: t('edit'),
      icon: 'pencil',
      onPress: props.payload.onEdit,
      visible: hasEditPermission(PermissionEntity.METERS, props.payload.meter)
    },
    {
      title: t('to_delete'),
      icon: 'delete-outline',
      onPress: props.payload.onDelete,
      color: theme.colors.error,
      visible: hasDeletePermission(PermissionEntity.METERS, props.payload.meter)
    }
  ];

  return <CustomActionSheet options={options} />;
}
