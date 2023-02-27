import { Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { View } from '../../components/Themed';
import { RootStackScreenProps } from '../../types';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useDispatch, useSelector } from '../../store';
import { PartMiniDTO } from '../../models/part';
import { getPartsMini } from '../../slices/part';
import { Button, Checkbox, Text, useTheme } from 'react-native-paper';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';

const PartsRoute = ({
                      toggle,
                      partsMini,
                      selectedIds
                    }: { toggle: (id: number) => void; partsMini: PartMiniDTO[]; selectedIds: number[] }) => {
  const { getFormattedCurrency } = useContext(CompanySettingsContext);
  const { t } = useTranslation();
  return (

    <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>{
      partsMini.map(part => (
        <View style={{
          marginTop: 5,
          padding: 10,
          display: 'flex',
          flexDirection: 'row',
          elevation: 2,
          justifyContent: 'space-between'
        }}>
          <Checkbox
            status={selectedIds.includes(part.id) ? 'checked' : 'unchecked'}
            onPress={() => {
              toggle(part.id);
            }}
          />
          <View style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
            <Text variant={'labelMedium'}>{part.name}</Text>
            <Text variant={'bodyMedium'}>{getFormattedCurrency(part.cost)}</Text>
          </View>
          <Button style={{ width: '40%' }} mode='outlined' buttonColor={'white'}>{t('details')}</Button>
        </View>))
    }</ScrollView>
  );
};

const SetsRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#673ab7' }} />
);
export default function SelectParts({ navigation, route }: RootStackScreenProps<'SelectParts'>) {
  const { onChange, selected } = route.params;
  const theme = useTheme();
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { partsMini } = useSelector((state) => state.parts);
  const { multiParts } = useSelector((state) => state.multiParts);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedParts, setSelectedParts] = useState<PartMiniDTO[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const layout = useWindowDimensions();
  const [tabs] = useState([
    { key: 'parts', title: t('parts') },
    { key: 'sets', title: t('sets_of_parts') }
  ]);
  useEffect(() => {
    if (partsMini.length) {
      const newSelectedParts = selectedIds
        .map((id) => {
          return partsMini.find((part) => part.id == id);
        })
        .filter((part) => !!part);
      setSelectedParts(newSelectedParts);
    }
  }, [selectedIds, partsMini]);

  useEffect(() => {
    if (!selectedIds.length) setSelectedIds(selected);
  }, [selected]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <Pressable disabled={!selectedParts.length} onPress={() => {
        onChange(selectedParts);
        navigation.goBack();
      }}><Text
        variant='titleMedium'>{t('add')}
      </Text></Pressable>
    });
  }, [selectedParts]);

  useEffect(() => {
    dispatch(getPartsMini());
  }, []);

  const onSelect = (ids: number[]) => {
    setSelectedIds(Array.from(new Set([...selectedIds, ...ids])));
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
  const renderScene = ({ route, jumpTo }) => {
    switch (route.key) {
      case 'parts':
        return <PartsRoute toggle={toggle} partsMini={partsMini} selectedIds={selectedIds} />;
      case 'sets':
        return <SetsRoute />;
    }
  };
  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: 'white' }}
      style={{ backgroundColor: theme.colors.primary }}
    />
  );
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
