import { Checkbox, Dialog, IconButton, Portal, Text, useTheme } from 'react-native-paper';
import { FilterField } from '../../models/page';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { pushOrRemove } from '../../utils/overall';
import _ from 'lodash';

interface OwnProps {
  filterFields: FilterField[];
  onChange: (filterFields: FilterField[]) => void;
  completeOptions: string[];
  initialOptions: string[];
  fieldName: string;
  icon: string;
}

export default function EnumFilter({
                                     filterFields,
                                     onChange,
                                     completeOptions,
                                     fieldName,
                                     initialOptions,
                                     icon
                                   }: OwnProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [newFilterFields, setNewFilterFields] = useState<FilterField[]>(filterFields);
  const [statuses, setStatuses] = useState<boolean[]>([]);
  const isSelected = !_.isEqual(statuses, completeOptions.map(option => initialOptions.includes(option)));
  const switchValue = (index: number, option: string) => {
    const newFilterFields = [...filterFields];
    const filterFieldIndex = newFilterFields.findIndex(
      (filterField) => filterField.field === fieldName
    );
    newFilterFields[filterFieldIndex] = {
      ...newFilterFields[filterFieldIndex],
      values: pushOrRemove(
        newFilterFields[filterFieldIndex].values,
        !statuses[index],
        option
      )
    };
    const newStatuses = [...statuses];
    newStatuses[index] = !newStatuses[index];
    setStatuses(newStatuses);
  };

  useEffect(() => {
    setStatuses(completeOptions.map(option => filterFields.some(
      (filterField) =>
        filterField.field === fieldName &&
        filterField.values.includes(option)
    )));
  }, [filterFields]);

  const renderDialog = () => {
    return <Portal>
      <Dialog visible={openDialog} onDismiss={() => {
        setOpenDialog(false);
        onChange(newFilterFields);
      }} style={{ backgroundColor: 'white' }}>
        <Dialog.Title>{t('select')}</Dialog.Title>
        <Dialog.Content>
          {completeOptions.map((option, index) => (
            <TouchableOpacity key={index} style={{
              marginTop: 5,
              padding: 10,
              display: 'flex',
              borderRadius: 5,
              flexDirection: 'row',
              alignItems: 'center'
            }} onPress={() => switchValue(index, option)}>
              <Checkbox
                status={statuses[index] ? 'checked' : 'unchecked'}
                onPress={() => switchValue(index, option)}
              />
              <Text>{option}</Text>
            </TouchableOpacity>
          ))}
        </Dialog.Content>
      </Dialog>
    </Portal>;
  };
  return (
    <TouchableOpacity
      onPress={() => {
        setOpenDialog(true);
      }}
      style={{
        backgroundColor: isSelected ? 'black' : theme.colors.background,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        paddingLeft: 15,
        margin: 5
      }}>
      {renderDialog()}
      <Text style={{ color: isSelected ? 'white' : 'black', fontWeight: 'bold' }}>{t(fieldName)}</Text><IconButton
      icon={'arrow-down-drop-circle-outline'}
      iconColor={isSelected ? 'white' : 'black'}
      size={15} /></TouchableOpacity>
  );
}
