import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Text } from 'react-native-paper';

import { View } from '../../components/Themed';
import { SuperUserStackScreenProps } from '../../types';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';

export default function SwitchAccountScreen({
                                              navigation
                                            }: SuperUserStackScreenProps<'SwitchAccount'>) {
  const { t } = useTranslation();
  const [switching, setSwitching] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number>(null);
  const { user, switchAccount } = useAuth();

  return (
    <ScrollView style={{ padding: 20 }} contentContainerStyle={{alignItems: "center"}}>
      <Text style={{ marginBottom: 40 }} variant='titleMedium'>{t('switch_account_description')}</Text>
      {user.superAccountRelations.map(superAccountRelation =>
        <Card  style={{ marginBottom: 20 }}
               key={superAccountRelation.childUserId} onPress={() => {
          setSwitching(true);
          setSelectedUserId(superAccountRelation.childUserId);
          switchAccount(superAccountRelation.childUserId).finally(() => setSwitching(false));
        }}>
          <Card.Content style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {superAccountRelation.childCompanyLogo ?
              <Avatar.Image source={{ uri: superAccountRelation.childCompanyLogo.url }} /> :
              <Avatar.Icon icon={'domain'} />}
            <Text style={{ fontWeight: 'bold', marginVertical: 10 }}>{superAccountRelation.childCompanyName}</Text>
            {switching && superAccountRelation.childUserId === selectedUserId ? <ActivityIndicator /> : null}
          </Card.Content>
        </Card>)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30
  }
});
