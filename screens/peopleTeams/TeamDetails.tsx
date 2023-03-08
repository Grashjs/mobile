import { Linking, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import LoadingDialog from '../../components/LoadingDialog';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../store';
import { RootStackScreenProps } from '../../types';
import { Avatar, Button, Dialog, Divider, IconButton, Portal, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { View } from '../../components/Themed';
import ListField from '../../components/ListField';
import { UserMiniDTO } from '../../models/user';
import { getUserUrl } from '../../utils/urlPaths';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { deleteTeam, getTeamDetails } from '../../slices/team';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import { SheetManager } from 'react-native-actions-sheet';
import { getUserInitials } from '../../utils/displayers';

export default function TeamDetails({ navigation, route }: RootStackScreenProps<'TeamDetails'>) {
  const { id } = route.params;
  const { loadingGet, teamInfos } = useSelector(state => state.teams);
  const team = teamInfos[id]?.team;
  const theme = useTheme();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { getFormattedDate } = useContext(
    CompanySettingsContext
  );
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const onDeleteSuccess = () => {
    showSnackBar(t('team_delete_success'), 'success');
    navigation.goBack();
  };
  const onDeleteFailure = (err) =>
    showSnackBar(t('team_delete_failure'), 'error');

  const handleDelete = () => {
    dispatch(deleteTeam(team?.id)).then(onDeleteSuccess).catch(onDeleteFailure);
    setOpenDelete(false);
  };
  const renderConfirmDelete = () => {
    return (<Portal>
      <Dialog visible={openDelete} onDismiss={() => setOpenDelete(false)}>
        <Dialog.Title>{t('confirmation')}</Dialog.Title>
        <Dialog.Content>
          <Text variant='bodyMedium'>{t('confirm_delete_team')}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setOpenDelete(false)}>{t('cancel')}</Button>
          <Button onPress={handleDelete}>{t('to_delete')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>);
  };

  useEffect(() => {
    const { id } = route.params;
    dispatch(getTeamDetails(id));
  }, [route]);

  useEffect(() => {
    navigation.setOptions({
      title: team?.name ?? t('loading'),
      headerRight: () => (
        <Pressable onPress={() => {
          SheetManager.show('team-details-sheet', {
            payload: {
              onEdit: () => navigation.navigate('EditTeam', { team }),
              onDelete: () => setOpenDelete(true)
            }
          });
        }}>
          <IconButton icon='dots-vertical' />
        </Pressable>
      )
    });
  }, [team]);


  if (team) return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {renderConfirmDelete()}
      {team.users.map(user => (
        <TouchableOpacity key={user.id} onPress={() => {
          navigation.navigate('UserDetails', { id: user.id });
        }}>
          <View style={{
            display: 'flex',
            flexDirection: 'row',
            padding: 20,
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {user.image ? <Avatar.Image source={{ uri: user.image.url }} /> :
              <Avatar.Text size={50} label={getUserInitials(user)} />}
            <Text>{`${user.firstName} ${user.lastName}`}</Text>
            <View>{user.phone &&
            <IconButton onPress={() => Linking.openURL(`tel:${user.phone}`)} icon={'phone'} />}</View>
          </View>
          <Divider />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
  else return (
    <LoadingDialog visible={loadingGet} />
  );
}
