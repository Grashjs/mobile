import ActionSheet, { ActionSheetRef, SheetProps } from 'react-native-actions-sheet';
import { View } from 'react-native';
import { Divider, List, Text } from 'react-native-paper';
import * as React from 'react';
import { useRef } from 'react';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { RootStackParamList } from '../../types';
import { useTranslation } from 'react-i18next';

export default function CreateEntitiesSheet(props: SheetProps<{ navigation: any }>) {
  const { t } = useTranslation();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const entities: { title: string; icon: IconSource; goTo: keyof RootStackParamList }[] = [{
    title: t('work_order'),
    icon: 'clipboard-text-outline',
    goTo: 'AddWorkOrder'
  },
    { title: t('request'), icon: 'inbox-arrow-down-outline', goTo: 'AddRequest' },
    { title: t('asset'), icon: 'package-variant-closed', goTo: 'AddAsset' },
    { title: t('location'), icon: 'map-marker-outline', goTo: 'AddLocation' },
    { title: t('part'), icon: 'archive-outline', goTo: 'AddPart' },
    { title: t('meter'), icon: 'gauge', goTo: 'AddMeter' },
    { title: t('user'), icon: 'account-outline', goTo: 'AddUser' }
  ];
  return (<ActionSheet ref={actionSheetRef}>
    <View style={{ paddingHorizontal: 5, paddingVertical: 15 }}>
      <Text variant='headlineSmall'>{t('create')}</Text>
      <Divider />
      <List.Section>
        {entities.map((entity, index) => <List.Item key={index}
                                                    style={{ paddingHorizontal: 15 }}
                                                    title={entity.title}
                                                    left={() => <List.Icon icon={entity.icon} />}
                                                    onPress={() => {
                                                      props.payload.navigation.navigate(entity.goTo);
                                                      actionSheetRef.current.hide();
                                                    }} />)}
      </List.Section>
    </View>
  </ActionSheet>);
}
