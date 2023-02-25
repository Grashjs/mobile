import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from '../components/Themed';
import EditScreenInfo from '../components/EditScreenInfo';
import { RootStackScreenProps, RootTabScreenProps } from '../types';
import { Button, Card, Divider, Text } from 'react-native-paper';
import { SelectList } from 'react-native-dropdown-select-list';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { CompanySettingsContext } from '../contexts/CompanySettingsContext';


export default function WODetailsScreen({ navigation, route }: RootStackScreenProps<'WODetails'>) {
  const { workOrder } = route.params;
  const { t } = useTranslation();
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const statuses = ['OPEN', 'ON_HOLD', 'IN_PROGRESS', 'COMPLETE'].map(status => ({ key: status, value: t(status) }));
  const fieldsToRender:
    {
      label: string;
      value: string | number;
    }[] = [
    {
      label: t('description'),
      value: workOrder.description
    },
    {
      label: t('due_date'),
      value: getFormattedDate(workOrder.dueDate)
    },
    {
      label: t('category'),
      value: workOrder.category?.name
    },
    {
      label: t('created_at'),
      value: getFormattedDate(workOrder.createdAt)
    }
  ];
  const touchableFields:
    {
      label: string;
      value: string | number;
    }[] = [
    {
      label: t('asset'),
      value: workOrder.asset?.name
    },
    {
      label: t('location'),
      value: workOrder.location?.name
    },
    {
      label: t('team'),
      value: workOrder.team?.name
    }
  ];
  return (
    <View style={styles.container}>
      <ScrollView style={{
        padding: 20
      }}>
        <Text variant='displaySmall'>{workOrder.title}</Text>
        <Text variant='titleMedium'>{`#${workOrder.id}`}</Text>
        <View style={{ marginTop: 20 }}>
          <SelectList
            searchPlaceholder={t('search')}
            setSelected={(status) => workOrder.status}
            defaultOption={{ key: workOrder.status, value: t(workOrder.status) }}
            data={statuses} />
          {fieldsToRender.map(({ label, value }, index) => (
            value && <View style={{ marginTop: 20 }}><Divider style={{ marginBottom: 20 }} />
              <Text variant='titleMedium'
                    style={{ fontWeight: 'bold' }}>{label}</Text>
              <Text variant='bodyLarge' style={{ marginTop: 15 }}>{value}</Text>
            </View>
          ))
          }
          {touchableFields.map(({ label, value }) => value && <TouchableOpacity style={{ marginTop: 20 }}>
            < Text variant='titleMedium'
                   style={{ fontWeight: 'bold' }}>{label}</Text>
            <Text variant='bodyLarge' style={{ marginTop: 15 }}>{value}</Text>
          </TouchableOpacity>)}
        </View>
      </ScrollView>
      <Button style={styles.startButton} mode='contained'>{t('start_work_order')}</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  },
  startButton: { position: 'absolute', bottom: 20, left: '45%' }
});
