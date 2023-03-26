import { SheetProps } from 'react-native-actions-sheet';
import { useTheme } from 'react-native-paper';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import Team from '../../models/team';
import CustomActionSheet, {
  CustomActionSheetOption
} from './CustomActionSheet';

export default function TeamDetailsSheet(
  props: SheetProps<{ onEdit: () => void; onDelete: () => void; team: Team }>
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
        PermissionEntity.PEOPLE_AND_TEAMS,
        props.payload.team
      )
    },
    {
      title: t('to_delete'),
      icon: 'delete-outline',
      onPress: props.payload.onDelete,
      color: theme.colors.error,
      visible: hasDeletePermission(
        PermissionEntity.PEOPLE_AND_TEAMS,
        props.payload.team
      )
    }
  ];

  return <CustomActionSheet options={options} />;
}
