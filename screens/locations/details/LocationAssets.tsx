import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../../store';
import { useTranslation } from 'react-i18next';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import Location from '../../../models/location';
import { useNavigation } from '@react-navigation/native';
import { editLocation } from '../../../slices/location';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, Text, Divider, Portal, Dialog, Button, IconButton } from 'react-native-paper';
import { View } from '../../../components/Themed';
import * as React from 'react';
import { getAssetsByLocation } from '../../../slices/asset';

export default function LocationAssets({ location }: { location: Location }) {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { assetsByLocation } = useSelector((state) => state.assets);
  const assets = assetsByLocation[location.id] ?? [];
  const theme = useTheme();

  useEffect(() => {
    dispatch(getAssetsByLocation(location.id));
  }, []);

  return (
    <ScrollView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      {assets.map(asset => (
        <TouchableOpacity key={asset.id} onPress={() => navigation.navigate('AssetDetails', { id: asset.id })}>
          <View style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 20,
            alignItems: 'center'
          }}>
            <Text style={{ fontWeight: 'bold' }}>{asset.name}</Text>
            <Text>{asset.description}</Text>
          </View>
          <Divider />
        </TouchableOpacity>
      ))}
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
