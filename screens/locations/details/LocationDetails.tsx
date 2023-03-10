import { useTranslation } from 'react-i18next';
import Location from '../../../models/location';
import { useContext } from 'react';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from '../../../components/Themed';
import { Divider, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../types';
import { UserMiniDTO } from '../../../models/user';
import { Customer } from '../../../models/customer';
import { Vendor } from '../../../models/vendor';
import Team from '../../../models/team';
import { getCustomerUrl, getTeamUrl, getUserUrl, getVendorUrl } from '../../../utils/urlPaths';
import ListField from '../../../components/ListField';
import * as React from 'react';

export default function LocationDetails({ location }: { location: Location }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const theme = useTheme();
  const fieldsToRender: {
    label: string;
    value: string | number;
  }[] = [
    { label: t('name'), value: location?.name },
    { label: t('address'), value: location?.address }

  ];
  return (
    <ScrollView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      {location.image && (
        <View style={{ marginVertical: 20 }}>
          <Image
            style={{ height: 200 }}
            source={{ uri: location.image.url }}
          />
        </View>
      )}
      {fieldsToRender.map(field => field.value && (
        <View key={field.label}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
            <Text>{field.label}</Text>
            <Text style={{ fontWeight: 'bold' }}>{field.value}</Text>
          </View>
          <Divider />
        </View>))}
      <ListField
        values={location?.workers}
        label={t('assigned_to')}
        getHref={(user: UserMiniDTO) => getUserUrl(user.id)}
        getValueLabel={(user: UserMiniDTO) =>
          `${user.firstName} ${user.lastName}`
        }
      />
      <ListField
        values={location?.customers}
        label={t('customers')}
        getHref={(customer: Customer) => getCustomerUrl(customer.id)}
        getValueLabel={(customer: Customer) => customer.name}
      />
      <ListField
        values={location?.vendors}
        label={t('vendors')}
        getHref={(vendor: Vendor) => getVendorUrl(vendor.id)}
        getValueLabel={(vendor: Vendor) => vendor.companyName}
      />
      <ListField
        values={location?.teams}
        label={t('teams')}
        getHref={(team: Team) => getTeamUrl(team.id)}
        getValueLabel={(team: Team) => team.name}
      />
    </ScrollView>
  );
}
const styles = StyleSheet.create(
  {
    container: {
      flex: 1
    }
  }
);
