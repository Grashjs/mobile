import ActionSheet, {
  ActionSheetRef,
  SheetProps
} from 'react-native-actions-sheet';
import { View } from 'react-native';
import { Divider, List, Text, useTheme } from 'react-native-paper';
import * as React from 'react';
import { useRef } from 'react';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { RootStackParamList } from '../../types';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import Meter from '../../models/meter';

export default function MeterDetailsSheet(
  props: SheetProps<{ onEdit: () => void; onDelete: () => void; meter: Meter }>
) {
  const { t } = useTranslation();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const theme = useTheme();
  const { hasEditPermission, hasDeletePermission } = useAuth();
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

  return (
    <ActionSheet ref={actionSheetRef}>
      <View style={{ padding: 15 }}>
        <Divider />
        <List.Section>
          {options
            .filter((option) => option.visible)
            .map((entity, index) => (
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
}
