import { SheetProps } from 'react-native-actions-sheet';
import { useTheme } from 'react-native-paper';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import Location from '../../models/location';
import CustomActionSheet, {
  CustomActionSheetOption
} from './CustomActionSheet';

export default function LocationDetailsSheet(
  props: SheetProps<{
    onEdit: () => void;
    onAddFile: () => void;
    onDelete: () => void;
    onCreateWorkOrder: () => void;
    onCreateAsset: () => void;
    location: Location;
  }>
) {
  const { t } = useTranslation();
  const { hasEditPermission, hasDeletePermission, hasCreatePermission } =
    useAuth();
  const theme = useTheme();
  const options: CustomActionSheetOption[] = [
    {
      title: t('edit'),
      icon: 'pencil',
      onPress: props.payload.onEdit,
      visible: hasEditPermission(
        PermissionEntity.LOCATIONS,
        props.payload.location
      )
    },
    {
      title: t('create_work_order'),
      icon: 'clipboard-text-outline',
      onPress: props.payload.onCreateWorkOrder,
      visible: hasCreatePermission(PermissionEntity.WORK_ORDERS)
    },
    {
      title: t('create_asset'),
      icon: 'package-variant-closed',
      onPress: props.payload.onCreateAsset,
      visible: hasCreatePermission(PermissionEntity.ASSETS)
    },
    {
      title: t('to_delete'),
      icon: 'delete-outline',
      onPress: props.payload.onDelete,
      color: theme.colors.error,
      visible: hasDeletePermission(
        PermissionEntity.LOCATIONS,
        props.payload.location
      )
    }
  ];

  return <CustomActionSheet options={options} />;
}
