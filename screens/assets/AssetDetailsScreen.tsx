import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';

import { View } from '../../components/Themed';
import { RootStackScreenProps } from '../../types';
import { useDispatch, useSelector } from '../../store';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { IconButton, useTheme } from 'react-native-paper';
import { SheetManager } from 'react-native-actions-sheet';
import { getAssetDetails } from '../../slices/asset';
import LoadingDialog from '../../components/LoadingDialog';
import AssetDetails from './details/AssetDetails';
import { TabBar, TabView } from 'react-native-tab-view';
import AssetWorkOrders from './details/AssetWorkOrders';

export default function AssetDetailsScreen({
                                             navigation,
                                             route
                                           }: RootStackScreenProps<'AssetDetails'>) {
  const { id } = route.params;

  const { t } = useTranslation();
  const { assetInfos, loadingGet } = useSelector(state => state.assets);
  const asset = assetInfos[id]?.asset;
  const dispatch = useDispatch();
  const theme = useTheme();
  const layout = useWindowDimensions();
  const [tabIndex, setTabIndex] = useState(0);
  const [tabs] = useState([
    { key: 'details', title: t('details') },
    { key: 'work-orders', title: t('work_orders') },
    { key: 'files', title: t('files') },
    { key: 'parts', title: t('parts') }
  ]);
  const renderScene = ({ route, jumpTo }) => {
    switch (route.key) {
      case 'details':
        return <AssetDetails asset={asset} />;
      case 'work-orders':
        return <AssetWorkOrders asset={asset} />;
      case 'files':
        return null;
    }
  };
  const renderTabBar = props => (
    <TabBar
      {...props}
      scrollEnabled
      indicatorStyle={{ backgroundColor: 'white' }}
      style={{ backgroundColor: theme.colors.primary }}
    />
  );

  useEffect(() => {
    dispatch(getAssetDetails(id));
  }, []);
  useEffect(() => {
    navigation.setOptions({
      title: asset?.name ?? t('loading'),
      headerRight: () => (
        <Pressable onPress={() => {
          SheetManager.show('asset-details-sheet', {
            payload: {}
          });
        }}>
          <IconButton icon='dots-vertical' />
        </Pressable>
      )
    });
  }, [asset]);

  if (asset)
    return (
      <View style={styles.container}>
        <TabView
          renderTabBar={renderTabBar}
          navigationState={{ index: tabIndex, routes: tabs }}
          renderScene={renderScene}
          onIndexChange={setTabIndex}
          initialLayout={{ width: layout.width }}
        />
      </View>
    );
  else return (
    <LoadingDialog visible={loadingGet} />
  );
}

const styles = StyleSheet.create(
  {
    container: {
      flex: 1
    }
  }
);
