import { View } from './Themed';
import {
  Button,
  Divider,
  IconButton,
  List,
  Portal,
  Provider,
  Text,
  TextInput,
  useTheme,
  Modal
} from 'react-native-paper';
import * as React from 'react';
import PartQuantity from '../models/partQuantity';
import { useContext, useEffect, useRef, useState } from 'react';
import { CompanySettingsContext } from '../contexts/CompanySettingsContext';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import partQuantity, { editPartQuantity } from '../slices/partQuantity';
import { useDispatch } from '../store';
import { CustomSnackBarContext } from '../contexts/CustomSnackBarContext';
import { useNavigation } from '@react-navigation/native';

export default function PartQuantities({
  partQuantities,
  rootId,
  navigation,
  isPO
}: {
  partQuantities: PartQuantity[];
  rootId: number;
  isPO: boolean;
  navigation: any;
}) {
  const { getFormattedCurrency } = useContext(CompanySettingsContext);
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [openModal, setOpenModal] = React.useState(false);
  const [quantity, setQuantity] = useState<number>(0);
  const [currentPartQuantity, setCurrentPartQuantity] =
    useState<PartQuantity>();
  const [loading, setLoading] = useState<boolean>(false);
  const showModal = () => {
    actionSheetRef.current.hide();
    setOpenModal(true);
  };
  useEffect(() => {
    if (currentPartQuantity) setQuantity(currentPartQuantity.quantity);
  }, [currentPartQuantity]);

  const hideModal = () => setOpenModal(false);
  const onPartQuantityChange = (value: number, partQuantityId: number) => {
    setLoading(true);
    dispatch(editPartQuantity(rootId, partQuantityId, value, isPO))
      .then(() => {
        showSnackBar(t('quantity_change_success'), 'success');
        hideModal();
      })
      .catch((err) => {
        showSnackBar(t('quantity_change_failure'), 'error');
        hideModal();
      })
      .finally(() => setLoading(false));
  };
  const renderActionSheet = () => {
    const options: {
      title: string;
      icon: IconSource;
      onPress: () => void;
      color?: string;
    }[] = [
      {
        title: t('edit_quantity'),
        icon: 'pencil',
        onPress: showModal
      },
      {
        title: t('to_delete'),
        icon: 'delete-outline',
        onPress: () => null,
        color: theme.colors.error
      }
    ];

    return (
      <ActionSheet ref={actionSheetRef}>
        <View style={{ padding: 15 }}>
          <Divider />
          <List.Section>
            {options.map((entity, index) => (
              <List.Item
                key={index}
                titleStyle={{ color: entity.color }}
                title={entity.title}
                left={() => (
                  <List.Icon icon={entity.icon} color={entity.color} />
                )}
                onPress={entity.onPress}
              />
            ))}
          </List.Section>
        </View>
      </ActionSheet>
    );
  };
  const renderModal = () => {
    return (
      <Portal theme={theme}>
        <Modal visible={openModal} onDismiss={hideModal} style={styles.modal}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
            {t('quantity')}
          </Text>
          <TextInput
            style={{ width: '100%', marginTop: 15 }}
            mode="outlined"
            label={t('quantity')}
            onChangeText={(newQuantity) =>
              setQuantity(Number(newQuantity.replace(/[^0-9]/g, '')))
            }
            value={quantity.toString()}
          />
          <Button
            disabled={loading}
            loading={loading}
            style={{ marginTop: 15 }}
            mode={'contained'}
            buttonColor={theme.colors.primary}
            onPress={() =>
              onPartQuantityChange(quantity, currentPartQuantity.id)
            }
          >
            {t('save')}
          </Button>
        </Modal>
      </Portal>
    );
  };
  return (
    <View>
      {renderActionSheet()}
      {renderModal()}
      {partQuantities.length === 0 ? (
        <Text variant={'titleMedium'}>{t('no_parts')}</Text>
      ) : (
        partQuantities.map((partQuantity) => (
          <View
            key={partQuantity.id}
            style={{
              ...styles.row,
              marginVertical: 10,
              justifyContent: 'space-between'
            }}
          >
            <Text
              style={{
                backgroundColor: theme.colors.secondary,
                padding: 7,
                borderRadius: 5,
                fontWeight: 'bold',
                color: 'white'
              }}
            >{`${partQuantity.quantity}x`}</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.push('PartDetails', { id: partQuantity.part.id })
              }
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: 5
              }}
            >
              <Text style={{ fontWeight: 'bold' }} variant="bodyLarge">
                {partQuantity.part.name}
              </Text>
              <Text>{getFormattedCurrency(partQuantity.part.cost)}</Text>
            </TouchableOpacity>
            <IconButton
              onPress={() => {
                setCurrentPartQuantity(partQuantity);
                actionSheetRef.current.show();
              }}
              icon="dots-vertical"
            />
          </View>
        ))
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
  shadowedCard: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    marginBottom: 10,
    elevation: 5
  },
  modal: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 2
    },
    height: '45%',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2
  }
});
