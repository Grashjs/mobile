import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from '../../store';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import { getMoreParts, getParts } from '../../slices/part';
import { FilterField, SearchCriteria } from '../../models/page';
import { Card, Searchbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Part from '../../models/part';
import { onSearchQueryChange } from '../../utils/overall';
import { RootStackScreenProps } from '../../types';
import Tag from '../../components/Tag';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';

export default function PartsScreen({ navigation, route }: RootStackScreenProps<'Parts'>) {
  const { t } = useTranslation();
  const [startedSearch, setStartedSearch] = useState<boolean>(false);
  const { parts, loadingGet, currentPageNum, lastPage } = useSelector(
    (state) => state.parts
  );
  const theme = useTheme();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const { getFormattedDate, getUserNameById } = useContext(
    CompanySettingsContext
  );
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
    if (hasViewPermission(PermissionEntity.WORK_ORDERS)) {
      dispatch(getParts({ ...criteria, pageSize: 10, pageNum: 0, direction: 'DESC' }));
    }
  }, [criteria]);


  const onRefresh = () => {
    setCriteria(getCriteriaFromFilterFields([]));
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
  const onQueryChange = (query) => {
    onSearchQueryChange<Part>(query, criteria, setCriteria, setSearchQuery, [
      'name',
      'barcode',
      'area',
      'category',
      'additionalInfos',
      'description'
    ]);
  };
  useDebouncedEffect(() => {
    if (startedSearch)
      onQueryChange(searchQuery);
  }, [searchQuery], 1000);
  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Searchbar
        placeholder={t('search')}
        onFocus={() => setStartedSearch(true)}
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
      <ScrollView style={styles.scrollView}
                  onScroll={({ nativeEvent }) => {
                    if (isCloseToBottom(nativeEvent)) {
                      if (!loadingGet && !lastPage)
                        dispatch(getMoreParts(criteria, currentPageNum + 1));
                    }
                  }}
                  refreshControl={
                    <RefreshControl refreshing={loadingGet} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
                  scrollEventThrottle={400}>
        {!!parts.content.length ? parts.content.map(part => (
          <Card style={{ padding: 5, marginVertical: 5, backgroundColor: 'white' }} key={part.id}
                onPress={() => navigation.navigate('WODetails', { id: part.id })}>
            <Card.Content>
              <View style={{ ...styles.row, justifyContent: 'space-between' }}>
                <View style={{ ...styles.row, justifyContent: 'space-between' }}>
                  <View style={{ marginRight: 10 }}>
                    <Tag text={`#${part.id}`} color='white' backgroundColor='#545454' />
                  </View>
                </View>
              </View>
              <Text variant='titleMedium'>{part.name}</Text>
            </Card.Content>
          </Card>
        )) : loadingGet ? null : <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          < Text variant={'titleLarge'}>{t('no_element_match_criteria')}</Text>
        </View>}
      </ScrollView>
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
