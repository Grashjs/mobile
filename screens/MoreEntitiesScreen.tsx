import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { IconButton, useTheme, Text, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, RootTabScreenProps } from '../types';

export default function MoreEntitiesScreen({ navigation }: RootTabScreenProps<'MoreEntities'>) {
  const theme = useTheme();
  const { t } = useTranslation();
  const entities: { label: string; icon: IconSource; color: string; backgroundColor: string; link: keyof RootStackParamList }[] = [{
    label: 'locations',
    icon: 'map-marker',
    color: '#2491d1',
    backgroundColor: '#c8cfd3',
    link: 'Locations'
  },
    {
      label: 'assets',
      icon: 'package-variant-closed',
      // @ts-ignore
      color: theme.colors.warning,
      backgroundColor: '#d2d0c4',
      link: 'Assets'
    },
    {
      label: 'parts',
      icon: 'archive-outline',
      color: '#8324d1',
      backgroundColor: '#cfc8d3',
      link: 'Parts'
    },
    {
      label: 'meters',
      icon: 'gauge',
      color: '#d12444',
      backgroundColor: '#d3c8ca',
      link: 'Meters'
    },
    {
      label: 'people_teams',
      icon: 'account',
      color: '#245bd1',
      backgroundColor: '#c8ccd3',
      link: 'PeopleTeams'
    },
    {
      label: 'vendors_and_customers',
      icon: 'vector-circle',
      //@ts-ignore
      color: theme.colors.warning,
      backgroundColor: '#d2d0c4',
      link: 'VendorsCustomers'
    }
  ];
  return (
    <ScrollView style={{ ...styles.container, backgroundColor: theme.colors.background, paddingHorizontal: 10 }}>
      {entities.map(({ label, icon, color, backgroundColor, link }) => (
        //@ts-ignore
        <TouchableOpacity onPress={() => navigation.navigate(link)}>
          <View style={{
            backgroundColor,
            display: 'flex',
            flexDirection: 'row',
            marginVertical: 5,
            borderRadius: 10,
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: 20
          }}>
            <Text variant={'titleMedium'}>{t(label)}</Text>
            <IconButton icon={icon} iconColor={color} />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
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
