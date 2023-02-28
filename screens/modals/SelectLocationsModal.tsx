import { Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from '../../components/Themed';
import { RootStackScreenProps } from '../../types';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../store';
import { LocationMiniDTO } from '../../models/location';
import { getLocationsMini } from '../../slices/location';
import { Checkbox, Divider, Text, useTheme } from 'react-native-paper';

export default function SelectLocationsModal({ navigation, route }: RootStackScreenProps<'SelectLocations'>) {
  const { onChange, selected, multiple } = route.params;
  const theme = useTheme();
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { locationsMini, loadingGet } = useSelector((state) => state.locations);
  const [selectedLocations, setSelectedLocations] = useState<LocationMiniDTO[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (locationsMini.length) {
      const newSelectedLocations = selectedIds
        .map((id) => {
          return locationsMini.find((location) => location.id == id);
        })
        .filter((location) => !!location);
      setSelectedLocations(newSelectedLocations);
    }
  }, [selectedIds, locationsMini]);

  useEffect(() => {
    if (!selectedIds.length) setSelectedIds(selected);
  }, [selected]);

  useEffect(() => {
    if (multiple) navigation.setOptions({
      headerRight: () => <Pressable disabled={!selectedLocations.length} onPress={() => {
        onChange(selectedLocations);
        navigation.goBack();
      }}><Text
        variant='titleMedium'>{t('add')}
      </Text></Pressable>
    });
  }, [selectedLocations]);

  useEffect(() => {
    dispatch(getLocationsMini());
  }, []);

  const onSelect = (ids: number[]) => {
    setSelectedIds(Array.from(new Set([...selectedIds, ...ids])));
    if (!multiple) {
      onChange([locationsMini.find(location => location.id === ids[0])]);
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
          <RefreshControl refreshing={loadingGet} onRefresh={() => dispatch(getLocationsMini())} />}
        style={{ flex: 1, paddingHorizontal: 20, backgroundColor: theme.colors.background }}>{
        locationsMini.map(location => (
          <TouchableOpacity onPress={() => {
            toggle(location.id);
          }} key={location.id} style={{
            marginTop: 5,
            borderRadius: 5,
            padding: 10,
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'row',
            elevation: 2,
            alignItems: 'center'
          }}>
            {multiple && <Checkbox
              status={selectedIds.includes(location.id) ? 'checked' : 'unchecked'}
              onPress={() => {
                toggle(location.id);
              }}
            />}
            <View style={{ display: 'flex', flexDirection: 'column' }}>
              <Text variant={'titleMedium'}>{location.name}</Text>
            </View>
            <Divider />
          </TouchableOpacity>))
      }</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
