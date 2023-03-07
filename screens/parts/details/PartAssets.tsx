import * as React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from '../../../store';
import { useTranslation } from 'react-i18next';
import Part from '../../../models/part';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { View } from '../../../components/Themed';
import { getAssetsByPart } from '../../../slices/asset';

export default function PartAssets({ part }: { part: Part }) {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { assetsByPart } = useSelector((state) => state.assets);
  const assets = assetsByPart[part.id] ?? [];
  const theme = useTheme();

  useEffect(() => {
    dispatch(getAssetsByPart(part.id));
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
