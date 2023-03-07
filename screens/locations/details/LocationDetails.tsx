import { useTranslation } from 'react-i18next';
import Location from '../../../models/location';
import { useContext } from 'react';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from '../../../components/Themed';
import { Divider, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../types';
import { UserMiniDTO } from '../../../models/user';
import { Customer } from '../../../models/customer';
import { Vendor } from '../../../models/vendor';
import Team from '../../../models/team';
import { getCustomerUrl, getTeamUrl, getUserUrl, getVendorUrl } from '../../../utils/urlPaths';

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
  const ListField = <T extends { id: number }>({
                                                 values,
                                                 label,
                                                 getHref,
                                                 getValueLabel
                                               }: {
    values: T[];
    label: string;
    getHref: (value: T) => { route: keyof RootStackParamList; params: {} };
    getValueLabel: (value: T) => string;
  }) => {
    return (
      !!values?.length && (
        <View>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
            <Text>{label}</Text>
            <View>
              {values.map((value, index) => (
                <TouchableOpacity style={{ marginTop: 5 }} key={label}
                  // @ts-ignore
                                  onPress={() => navigation.navigate(getHref(value).route, getHref(value).params)}>
                  <Text style={{
                    fontWeight: 'bold',
                    color: theme.colors.primary
                  }}>{getValueLabel(value)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Divider />
        </View>
      ));
  };
  return (
    <ScrollView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
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
