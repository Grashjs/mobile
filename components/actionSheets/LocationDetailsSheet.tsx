import ActionSheet, { ActionSheetRef, SheetProps } from 'react-native-actions-sheet';
import { View } from 'react-native';
import { Divider, List, Text, useTheme } from 'react-native-paper';
import * as React from 'react';
import { useRef } from 'react';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { RootStackParamList } from '../../types';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import Location from '../../models/location';

export default function LocationDetailsSheet(props: SheetProps<{ onEdit: () => void; onAddFile: () => void; onDelete: () => void, onCreateWorkOrder: () => void, onCreateAsset: () => void, location: Location }>) {
  const { t } = useTranslation();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const { hasEditPermission, hasDeletePermission, hasCreatePermission } = useAuth();
  const theme = useTheme();
  const options: {
    title: string;
    icon: IconSource;
    onPress: () => void;
    color?: string;
    visible: boolean;
  }[] = [
    {
      title: t('edit'),
      icon: 'pencil',
      onPress: props.payload.onEdit,
      visible: hasEditPermission(PermissionEntity.LOCATIONS, props.payload.location)
    },
    {
      title: t('create_work_order'),
      icon: 'clipboard-text',
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
      visible: hasDeletePermission(PermissionEntity.LOCATIONS, props.payload.location)
    }
  ];

  return (
    <ActionSheet ref={actionSheetRef}>
      <View style={{ padding: 15 }}>
        <Divider />
        <List.Section>
          {options.filter(option => option.visible).map((entity, index) => (
            <List.Item
              key={index}
              titleStyle={{ color: entity.color }}
              title={entity.title}
              left={() => (
                <List.Icon icon={entity.icon} color={entity.color} />
              )}
              onPress={() => {
                actionSheetRef.current.hide();
                entity.onPress();
              }}
            />
          ))}
        </List.Section>
      </View>
    </ActionSheet>
  );
  ;
}
