import { StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';
import { Avatar, Button, Dialog, IconButton, List, Portal, useTheme, Text } from 'react-native-paper';
import useAuth from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { getUserInitials } from '../utils/displayers';
import * as React from 'react';
import { RootStackScreenProps } from '../types';
import { useState } from 'react';

export default function SettingsScreen({ navigation }: RootStackScreenProps<'Settings'>) {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [openLogout, setOpenLogout] = useState<boolean>(false);
  const renderConfirmLogout = () => {
    return (<Portal theme={theme}>
      <Dialog visible={openLogout} onDismiss={() => setOpenLogout(false)}>
        <Dialog.Title>{t('confirmation')}</Dialog.Title>
        <Dialog.Content>
          <Text variant='bodyMedium'>{t('confirm_logout')}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setOpenLogout(false)}>{t('cancel')}</Button>
          <Button onPress={logout}>{t('Sign out')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>);
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {renderConfirmLogout()}
      <View>
        <List.Item style={{ paddingHorizontal: 20 }}
                   left={props => user.image ? <Avatar.Image source={{ uri: user.image.url }} /> :
                     <Avatar.Text size={50} label={getUserInitials(user)} />}
                   title={user.email}
                   description={t('update_profile')}
                   onPress={() => navigation.navigate('UserProfile')} />
        <List.Item style={{ paddingHorizontal: 20 }}
                   left={props => <IconButton iconColor={theme.colors.error} icon={'logout'} />}
                   title={t('Sign out')}
                   titleStyle={{ color: theme.colors.error }}
                   onPress={() => setOpenLogout(true)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
});
