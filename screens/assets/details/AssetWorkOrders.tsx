import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from '../../../store';
import { useTranslation } from 'react-i18next';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { AssetDTO } from '../../../models/asset';
import { useNavigation } from '@react-navigation/native';
import { getAssetWorkOrders } from '../../../slices/asset';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, Text, Divider } from 'react-native-paper';
import { View } from '../../../components/Themed';
import * as React from 'react';

export default function AssetWorkOrders({ asset }: { asset: AssetDTO }) {
  const { t }: { t: any } = useTranslation();
  const { assetInfos, loadingWorkOrders } = useSelector((state) => state.assets);
  const workOrders = assetInfos[asset?.id]?.workOrders;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const theme = useTheme();

  useEffect(() => {
    if (asset) dispatch(getAssetWorkOrders(asset.id));
  }, [asset]);

  return (
    <ScrollView style={{ ...styles.container, backgroundColor: theme.colors.background }}
                refreshControl={
                  <RefreshControl refreshing={loadingWorkOrders}
                                  colors={[theme.colors.primary]} />}>
      {workOrders.map(workOrder => (
        <TouchableOpacity key={workOrder.id} onPress={() => navigation.navigate('WODetails', { id: workOrder.id })}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
            <Text style={{ fontWeight: 'bold' }}>{workOrder.title}</Text>
            <Text>{t(workOrder.status)}</Text>
          </View>
          <Divider />
        </TouchableOpacity>
      ))}
      {!loadingWorkOrders && workOrders.length === 0 && (
        <View style={{ padding: 20 }}>
          <Text variant={'titleLarge'}>{t('no_wo_linked_asset')}</Text>
        </View>
      )}
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
