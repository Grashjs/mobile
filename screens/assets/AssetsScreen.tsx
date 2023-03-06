import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from '../../store';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import { getAssetChildren, getAssets, getMoreAssets } from '../../slices/asset';
import { FilterField, SearchCriteria } from '../../models/page';
import { Button, Card, IconButton, Searchbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Asset, { AssetDTO } from '../../models/asset';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { onSearchQueryChange } from '../../utils/overall';
import { RootStackScreenProps } from '../../types';
import Tag from '../../components/Tag';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';

function IconWithLabel({ icon, label }: { icon: IconSource, label: string }) {
  return (
    <View style={{ ...styles.row, justifyContent: 'flex-start' }}>
      <IconButton icon={icon} size={20} />
      <Text variant={'bodyMedium'}>{label}</Text>
    </View>
  );
}

export default function AssetsScreen({ navigation, route }: RootStackScreenProps<'Assets'>) {
  const { t } = useTranslation();
  const [startedSearch, setStartedSearch] = useState<boolean>(false);
  const { assets, assetsHierarchy, loadingGet, currentPageNum, lastPage } = useSelector(
    (state) => state.assets
  );
  const theme = useTheme();
  const [view, setView] = useState<'hierarchy' | 'list'>('hierarchy');
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const {
    hasViewPermission
  } = useAuth();
  const defaultFilterFields: FilterField[] = [];
  const getCriteriaFromFilterFields = (filterFields: FilterField[]) => {
    const initialCriteria: SearchCriteria = {
      filterFields: defaultFilterFields,
      pageSize: 10,
      pageNum: 0,
      direction: 'DESC'
    };
    let newFilterFields = [...initialCriteria.filterFields];
    filterFields.forEach(filterField => (newFilterFields = newFilterFields.filter(ff => ff.field != filterField.field)));
    return { ...initialCriteria, filterFields: [...newFilterFields, ...filterFields] };
  };
  const [criteria, setCriteria] = useState<SearchCriteria>(getCriteriaFromFilterFields([]));
  useEffect(() => {
    if (hasViewPermission(PermissionEntity.ASSETS) && view === 'list') {
      dispatch(getAssets({ ...criteria, pageSize: 10, pageNum: 0, direction: 'DESC' }));
    }
  }, [criteria]);
  const [currentAssets, setCurrentAssets] = useState([]);
  useEffect(() => {
    if (route.params?.id && assetsHierarchy.some(asset => asset.hierarchy.includes(route.params.id) && asset.id !== route.params.id)) {
      return;
    }
    dispatch(getAssetChildren(route.params?.id ?? 0, route.params?.hierarchy ?? []));
  }, [route]);

  const onRefresh = () => {
    setCriteria(getCriteriaFromFilterFields([]));
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
  const onQueryChange = (query) => {
    onSearchQueryChange<AssetDTO>(query, criteria, setCriteria, setSearchQuery, [
      'name',
      'model',
      'description',
      'additionalInfos'
    ]);
    setView('list');
  };
  useDebouncedEffect(() => {
    if (startedSearch)
      onQueryChange(searchQuery);
  }, [searchQuery], 1000);

  useEffect(() => {
    let result = [];
    if (route.params?.id) {
      result = assetsHierarchy.filter((asset, index) => {
          return asset.hierarchy.includes(route.params.id) && asset.id !== route.params.id;
        }
      );
    } else result = assetsHierarchy;
    setCurrentAssets(result);
  }, [assetsHierarchy]);

  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Searchbar
        placeholder={t('search')}
        onFocus={() => setStartedSearch(true)}
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
      {view === 'list' ? <ScrollView style={styles.scrollView}
                                     onScroll={({ nativeEvent }) => {
                                       if (isCloseToBottom(nativeEvent)) {
                                         if (!loadingGet && !lastPage)
                                           dispatch(getMoreAssets(criteria, currentPageNum + 1));
                                       }
                                     }}
                                     refreshControl={
                                       <RefreshControl refreshing={loadingGet} onRefresh={onRefresh}
                                                       colors={[theme.colors.primary]} />}
                                     scrollEventThrottle={400}>
        {!!assets.content.length ? assets.content.map(asset => (
          <Card style={{ padding: 5, marginVertical: 5, backgroundColor: 'white' }} key={asset.id}
                onPress={() => navigation.navigate('WODetails', { id: asset.id })}>
            <Card.Content>
              <View style={{ ...styles.row, justifyContent: 'space-between' }}>
                <View style={{ ...styles.row, justifyContent: 'space-between' }}>
                  <View style={{ marginRight: 10 }}>
                    <Tag text={`#${asset.id}`} color='white' backgroundColor='#545454' />
                  </View>
                </View>
              </View>
              <Text variant='titleMedium'>{asset.name}</Text>
              {asset.location && <IconWithLabel label={asset.location.name} icon='map-marker-outline' />}
            </Card.Content>
          </Card>
        )) : loadingGet ? null : <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          < Text variant={'titleLarge'}>{t('no_element_match_criteria')}</Text>
        </View>}
      </ScrollView> : <ScrollView style={styles.scrollView} refreshControl={
        <RefreshControl refreshing={loadingGet}
                        colors={[theme.colors.primary]} />}>
        {!!currentAssets.length && currentAssets.map(asset => (
          <Card style={{ padding: 5, marginVertical: 5, backgroundColor: 'white' }} key={asset.id}
                onPress={() => navigation.navigate('WODetails', { id: asset.id })}>
            <Card.Content>
              <View style={{ ...styles.row, justifyContent: 'space-between' }}>
                <View style={{ ...styles.row, justifyContent: 'space-between' }}>
                  <View style={{ marginRight: 10 }}>
                    <Tag text={`#${asset.id}`} color='white' backgroundColor='#545454' />
                  </View>
                </View>
              </View>
              <Text variant='titleMedium'>{asset.name}</Text>
              {asset.location && <IconWithLabel label={asset.location.name} icon='map-marker-outline' />}
            </Card.Content>
            <Card.Actions>
              {asset.hasChildren && <Button onPress={() => {
                navigation.push('Assets', { id: asset.id, hierarchy: asset.hierarchy });
              }}>{t('view_children')}</Button>}
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  scrollView: {
    width: '100%',
    height: '100%',
    padding: 5
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
});
