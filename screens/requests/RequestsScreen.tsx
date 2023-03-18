import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from '../../store';
import * as React from 'react';
import { Fragment, useContext, useEffect, useState } from 'react';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import { getMoreRequests, getRequests } from '../../slices/request';
import { FilterField, SearchCriteria } from '../../models/page';
import {
  Card,
  IconButton,
  Searchbar,
  Text,
  useTheme
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Request from '../../models/request';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { getPriorityColor, onSearchQueryChange } from '../../utils/overall';
import { RootTabScreenProps } from '../../types';
import Tag from '../../components/Tag';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';

function IconWithLabel({ icon, label }: { icon: IconSource; label: string }) {
  return (
    <View style={{ ...styles.row, justifyContent: 'flex-start' }}>
      <IconButton icon={icon} size={20} />
      <Text variant={'bodyMedium'}>{label}</Text>
    </View>
  );
}

export default function RequestsScreen({
  navigation,
  route
}: RootTabScreenProps<'Requests'>) {
  const { t } = useTranslation();
  const [startedSearch, setStartedSearch] = useState<boolean>(false);
  const { requests, loadingGet, currentPageNum, lastPage } = useSelector(
    (state) => state.requests
  );
  const theme = useTheme();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const { getFormattedDate, getUserNameById } = useContext(
    CompanySettingsContext
  );
  const { hasViewPermission } = useAuth();
  const defaultFilterFields: FilterField[] = [];
  const getCriteriaFromFilterFields = (filterFields: FilterField[]) => {
    const initialCriteria: SearchCriteria = {
      filterFields: defaultFilterFields,
      pageSize: 10,
      pageNum: 0,
      direction: 'DESC'
    };
    let newFilterFields = [...initialCriteria.filterFields];
    filterFields.forEach(
      (filterField) =>
        (newFilterFields = newFilterFields.filter(
          (ff) => ff.field != filterField.field
        ))
    );
    return {
      ...initialCriteria,
      filterFields: [...newFilterFields, ...filterFields]
    };
  };
  const [criteria, setCriteria] = useState<SearchCriteria>(
    getCriteriaFromFilterFields([])
  );
  useEffect(() => {
    if (hasViewPermission(PermissionEntity.REQUESTS)) {
      dispatch(
        getRequests({
          ...criteria,
          pageSize: 10,
          pageNum: 0,
          direction: 'DESC'
        })
      );
    }
  }, [criteria]);

  const onRefresh = () => {
    setCriteria(getCriteriaFromFilterFields([]));
  };

  const getStatusMeta = (request: Request): [string, string] => {
    if (request.workOrder) {
      // @ts-ignore
      return [t('approved'), theme.colors.success];
    } else if (request.cancelled) {
      return [t('rejected'), theme.colors.error];
    } else return [t('pending'), theme.colors.primary];
  };
  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };
  const onQueryChange = (query) => {
    onSearchQueryChange<Request>(query, criteria, setCriteria, setSearchQuery, [
      'title',
      'description'
    ]);
  };
  useDebouncedEffect(
    () => {
      if (startedSearch) onQueryChange(searchQuery);
    },
    [searchQuery],
    1000
  );
  return (
    <View
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      {hasViewPermission(PermissionEntity.REQUESTS) ? (
        <Fragment>
          <Searchbar
            placeholder={t('search')}
            onFocus={() => setStartedSearch(true)}
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
          <ScrollView
            style={styles.scrollView}
            onScroll={({ nativeEvent }) => {
              if (isCloseToBottom(nativeEvent)) {
                if (!loadingGet && !lastPage)
                  dispatch(getMoreRequests(criteria, currentPageNum + 1));
              }
            }}
            refreshControl={
              <RefreshControl
                refreshing={loadingGet}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
            scrollEventThrottle={400}
          >
            {!!requests.content.length ? (
              requests.content.map((request) => (
                <Card
                  style={{
                    padding: 5,
                    marginVertical: 5,
                    backgroundColor: 'white'
                  }}
                  key={request.id}
                  onPress={() => {
                    if (request.workOrder) {
                      navigation.push('WODetails', {
                        id: request.workOrder.id
                      });
                    } else
                      navigation.push('RequestDetails', { id: request.id });
                  }}
                >
                  <Card.Content>
                    <View
                      style={{ ...styles.row, justifyContent: 'space-between' }}
                    >
                      <View
                        style={{
                          ...styles.row,
                          justifyContent: 'space-between'
                        }}
                      >
                        <View style={{ marginRight: 10 }}>
                          <Tag
                            text={`#${request.id}`}
                            color="white"
                            backgroundColor="#545454"
                          />
                        </View>
                        <View style={{ marginRight: 10 }}>
                          <Tag
                            text={t(request.priority)}
                            color="white"
                            backgroundColor={getPriorityColor(
                              request.priority,
                              theme
                            )}
                          />
                        </View>
                        <Tag
                          text={getStatusMeta(request)[0]}
                          color="white"
                          backgroundColor={getStatusMeta(request)[1]}
                        />
                      </View>
                    </View>
                    <Text variant="titleMedium">{request.title}</Text>
                    {request.dueDate && (
                      <IconWithLabel
                        label={getFormattedDate(request.dueDate)}
                        icon="clock-alert-outline"
                      />
                    )}
                    {request.asset && (
                      <IconWithLabel
                        label={request.asset.name}
                        icon="package-variant-closed"
                      />
                    )}
                    {request.location && (
                      <IconWithLabel
                        label={request.location.name}
                        icon="map-marker-outline"
                      />
                    )}
                  </Card.Content>
                </Card>
              ))
            ) : loadingGet ? null : (
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: 10
                }}
              >
                <Text variant={'titleLarge'}>
                  {t('no_element_match_criteria')}
                </Text>
              </View>
            )}
          </ScrollView>
        </Fragment>
      ) : (
        <View
          style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}
        >
          <Text variant={'titleLarge'}>{t('no_access_requests')}</Text>
        </View>
      )}
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
