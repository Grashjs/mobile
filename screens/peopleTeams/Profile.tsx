import { ScrollView } from 'react-native';
import LoadingDialog from '../../components/LoadingDialog';
import * as React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from '../../store';
import { RootStackScreenProps } from '../../types';
import { Avatar, Divider, Switch, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { View } from '../../components/Themed';
import { getUserDetails } from '../../slices/user';
import useAuth from '../../hooks/useAuth';
import UserSettings from '../../models/userSettings';
import { getUserInitials } from '../../utils/displayers';

export default function UserProfile({ navigation, route }: RootStackScreenProps<'UserProfile'>) {
  const { user, fetchUserSettings, patchUserSettings, userSettings } = useAuth();
  const theme = useTheme();
  const { t } = useTranslation();
  const fieldsToRender = [
    {
      label: t('id'),
      value: user?.id
    },
    {
      label: t('first_name'),
      value: user?.firstName
    },
    {
      label: t('last_name'),
      value: user?.lastName
    },
    {
      label: t('email'),
      value: user?.email
    },
    {
      label: t('phone'),
      value: user?.phone
    },
    {
      label: t('job_title'),
      value: user?.jobTitle
    },
    {
      label: t('role'),
      value: user?.role.name
    },
    {
      label: t('hourly_rate'),
      value: user?.rate
    }
  ];
  const switches: { value: boolean; title: string; accessor: keyof UserSettings }[] = [{
    value: userSettings?.emailNotified,
    title: t('email_notifications'),
    accessor: 'emailNotified'
  },
    {
      value: userSettings?.emailUpdatesForWorkOrders,
      title: t('email_updates_wo'),
      accessor: 'emailUpdatesForWorkOrders'
    },
    {
      value: userSettings?.emailUpdatesForRequests,
      title: t('email_updates_requests'),
      accessor: 'emailUpdatesForRequests'

    },
    {
      value: userSettings?.emailUpdatesForPurchaseOrders,
      title: t('po_emails'),
      accessor: 'emailUpdatesForPurchaseOrders'
    }
  ];

  useEffect(() => {
    fetchUserSettings();
  }, []);

  function BasicField({
                        label,
                        value
                      }: {
    label: string;
    value: string | number;
  }) {
    if (value)
      return (
        <View key={label} style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text variant='titleMedium' style={{ fontWeight: 'bold' }}>
            {label}
          </Text>
          <Text variant='bodyLarge'>{value}</Text>
          <Divider style={{ marginTop: 5 }} />
        </View>
      );
    else return null;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 10 }}>
      <View style={{ alignItems: 'center', paddingTop: 20 }}>
        {user.image ? <Avatar.Image source={{ uri: user.image.url }} /> :
          <Avatar.Text size={50} label={getUserInitials(user)} />}
      </View>
      {fieldsToRender.map(field => <BasicField key={field.label} label={field.label} value={field.value} />
      )}
      {switches.map(({ title, value, accessor }) => (
        <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>{title}</Text>
            <Switch value={Boolean(userSettings[accessor])} onValueChange={checked => patchUserSettings({
              ...userSettings,
              [accessor]: checked
            })} />
          </View>
          <Divider />
        </View>))}
    </ScrollView>
  );
}
