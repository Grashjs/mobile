import ActionSheet, { ActionSheetRef, SheetProps } from 'react-native-actions-sheet';
import { View } from 'react-native';
import { Divider, List, useTheme } from 'react-native-paper';
import * as React from 'react';
import { useRef } from 'react';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import { AssetDTO } from '../../models/asset';

export default function AssetDetailsSheet(props: SheetProps<{ onEdit: () => void; onAddFile: () => void; onAddPart: () => void; onDelete: () => void; asset: AssetDTO }>) {
  const { t } = useTranslation();
  const { hasEditPermission, hasDeletePermission } = useAuth();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const theme = useTheme();
  const options: {
    title: string;
    icon: IconSource;
    onPress: () => void;
    color?: string;
    shown: boolean;
  }[] = [
    {
      title: t('edit'),
      icon: 'pencil',
      onPress: props.payload.onEdit,
      shown: hasEditPermission(PermissionEntity.ASSETS, props.payload.asset)
    },
    {
      title: t('to_delete'),
      icon: 'delete-outline',
      onPress: props.payload.onDelete,
      color: theme.colors.error,
      shown: hasDeletePermission(PermissionEntity.ASSETS, props.payload.asset)
    }
  ];

  return (
    <ActionSheet ref={actionSheetRef}>
      <View style={{ padding: 15 }}>
        <Divider />
        <List.Section>
          {options.filter(option => option.shown).map((entity, index) => (
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
