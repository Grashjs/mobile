import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { View } from '../../components/Themed';
import { RootStackScreenProps } from '../../types';
import { useDispatch, useSelector } from '../../store';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { useContext, useEffect, useState } from 'react';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { Button, Dialog, IconButton, Portal, Provider, Text, useTheme } from 'react-native-paper';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import { SheetManager } from 'react-native-actions-sheet';
import * as React from 'react';
import { getAssetDetails } from '../../slices/asset';
import LoadingDialog from '../../components/LoadingDialog';

export default function AssetDetailsScreen({
                                             navigation,
                                             route
                                           }: RootStackScreenProps<'AssetDetails'>) {
  const { id } = route.params;

  const { t } = useTranslation();
  const { assetInfos, loadingGet } = useSelector(state => state.assets);
  const asset = assetInfos[id]?.asset;
  const { hasEditPermission, user, companySettings, hasFeature } = useAuth();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const [loading, setLoading] = useState<boolean>(false);
  const theme = useTheme();
  const dispatch = useDispatch();
  const fieldsToRender: {
    label: string;
    value: string | number;
  }[] = [
    {
      label: t('description'),
      value: asset?.description
    },

    {
      label: t('category'),
      value: asset?.category?.name
    },
    {
      label: t('created_at'),
      value: getFormattedDate(asset?.createdAt)
    }
  ];
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
      <ScrollView>

      </ScrollView>
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
