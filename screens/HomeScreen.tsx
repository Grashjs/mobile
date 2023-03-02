import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import { IconButton, useTheme, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ExtendedWorkOrderStatus, getStatusColor } from '../utils/overall';

export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {
  const theme = useTheme();
  const { t } = useTranslation();
  const iconButtonStyle = { ...styles.iconButton, backgroundColor: theme.colors.background };
  const stats: { label: ExtendedWorkOrderStatus; value: number }[] = [{ label: 'OPEN', value: 5 }, {
    label: 'ON_HOLD',
    value: 2
  }, {
    label: 'IN_PROGRESS',
    value: 5
  }, { label: 'COMPLETE', value: 2 },
    { label: 'LATE_WO', value: 3 },
    { label: 'TODAY_WO', value: 5 },
    { label: 'HIGH_WO', value: 4 }];
  return (
    <ScrollView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <IconButton style={iconButtonStyle}
                    icon={'poll'} />
        <IconButton style={iconButtonStyle} icon={'bell'} />
        <IconButton style={iconButtonStyle} icon={'package-variant-closed'} />
      </View>
      {stats.map(stat => (
        <View
          style={{
            marginHorizontal: 10,
            marginTop: 20,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10
          }}>
          <TouchableOpacity
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%'
            }}>
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center'
            }}>
              <View
                style={{ width: 2, height: 30, backgroundColor: getStatusColor(stat.label, theme) }}>{null}</View>
              <Text variant={'titleSmall'} style={{ fontWeight: 'bold', marginLeft: 10 }}>{t(stat.label)}</Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text>{stat.value}</Text>
              <IconButton icon={'arrow-right-bold-circle-outline'} />
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  iconButton: { width: 50, height: 50, borderRadius: 25 }
});
