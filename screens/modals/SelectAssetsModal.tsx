import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { View } from '../../components/Themed';
import { RootStackScreenProps } from '../../types';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../store';
import { AssetMiniDTO } from '../../models/asset';
import { getAssetsMini } from '../../slices/asset';
import { Checkbox, Divider, Text, useTheme } from 'react-native-paper';

export default function SelectAssetsModal({
  navigation,
  route
}: RootStackScreenProps<'SelectAssets'>) {
  const { onChange, selected, multiple } = route.params;
  const theme = useTheme();
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { assetsMini, loadingGet } = useSelector((state) => state.assets);
  const [selectedAssets, setSelectedAssets] = useState<AssetMiniDTO[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (assetsMini.length) {
      const newSelectedAssets = selectedIds
        .map((id) => {
          return assetsMini.find((asset) => asset.id == id);
        })
        .filter((asset) => !!asset);
      setSelectedAssets(newSelectedAssets);
    }
  }, [selectedIds, assetsMini]);

  useEffect(() => {
    if (!selectedIds.length) setSelectedIds(selected);
  }, [selected]);

  useEffect(() => {
    if (multiple)
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            disabled={!selectedAssets.length}
            onPress={() => {
              onChange(selectedAssets);
              navigation.goBack();
            }}
          >
            <Text variant="titleMedium">{t('add')}</Text>
          </Pressable>
        )
      });
  }, [selectedAssets]);

  useEffect(() => {
    dispatch(getAssetsMini());
  }, []);

  const onSelect = (ids: number[]) => {
    setSelectedIds(Array.from(new Set([...selectedIds, ...ids])));
    if (!multiple) {
      onChange([assetsMini.find((asset) => asset.id === ids[0])]);
      navigation.goBack();
    }
  };
  const onUnSelect = (ids: number[]) => {
    const newSelectedIds = selectedIds.filter((id) => !ids.includes(id));
    setSelectedIds(newSelectedIds);
  };
  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onUnSelect([id]);
    } else {
      onSelect([id]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loadingGet}
            onRefresh={() => dispatch(getAssetsMini())}
          />
        }
        style={{
          flex: 1,
          paddingHorizontal: 20,
          backgroundColor: theme.colors.background
        }}
      >
        {assetsMini.map((asset) => (
          <TouchableOpacity
            onPress={() => {
              toggle(asset.id);
            }}
            key={asset.id}
            style={{
              marginTop: 5,
              borderRadius: 5,
              padding: 10,
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'row',
              elevation: 2,
              alignItems: 'center'
            }}
          >
            {multiple && (
              <Checkbox
                status={
                  selectedIds.includes(asset.id) ? 'checked' : 'unchecked'
                }
                onPress={() => {
                  toggle(asset.id);
                }}
              />
            )}
            <View style={{ display: 'flex', flexDirection: 'column' }}>
              <Text variant={'titleMedium'}>{asset.name}</Text>
            </View>
            <Divider />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
