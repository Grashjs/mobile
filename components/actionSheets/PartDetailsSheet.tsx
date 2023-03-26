import { SheetProps } from 'react-native-actions-sheet';
import { useTheme } from 'react-native-paper';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import Part from '../../models/part';
import CustomActionSheet, {
  CustomActionSheetOption
} from './CustomActionSheet';

export default function PartDetailsSheet(
  props: SheetProps<{
    onEdit: () => void;
    onAddFile: () => void;
    onDelete: () => void;
    part: Part;
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
        PermissionEntity.PARTS_AND_MULTIPARTS,
        props.payload.part
      )
    },
    {
      title: t('to_delete'),
      icon: 'delete-outline',
      onPress: props.payload.onDelete,
      color: theme.colors.error,
      visible: hasDeletePermission(
        PermissionEntity.PARTS_AND_MULTIPARTS,
        props.payload.part
      )
    }
  ];

  return <CustomActionSheet options={options} />;
}
