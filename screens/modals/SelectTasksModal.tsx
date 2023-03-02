import { Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from '../../components/Themed';
import { RootStackScreenProps } from '../../types';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { Fragment, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../store';
import { AssetMiniDTO } from '../../models/asset';
import { getAssetsMini } from '../../slices/asset';
import {
  Button,
  Checkbox,
  Divider,
  IconButton,
  List,
  RadioButton,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { TaskBase, TaskOption, TaskType } from '../../models/tasks';
import { UserMiniDTO } from '../../models/user';
import File from '../../models/file';
import { randomInt } from '../../utils/generators';
import { getTaskFromTaskBase } from '../../utils/formatters';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { getTaskTypes } from '../../utils/displayers';

export default function SelectTasksModal({ navigation, route }: RootStackScreenProps<'SelectTasks'>) {
  const { onChange, selected } = route.params;
  const theme = useTheme();
  const [type, setType] = useState<TaskType>('SUBTASK');
  const [label, setLabel] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [user, setUser] = useState<UserMiniDTO>();
  const [asset, setAsset] = useState<AssetMiniDTO>();
  const { t }: { t: any } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const onOptionChange = (value: string, index: number) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  const onAddNewOption = () => {
    setOptions([...options, '']);
  };
  const onRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <Pressable onPress={() => {
        if (!label?.trim()) {
          showSnackBar(t('required_task_label'), 'error');
          return;
        }
        if (type === 'MULTIPLE' && options.some(option => !option.trim())) {
          showSnackBar(t('remove_blank_options'), 'error');
          return;
        }
        onChange([...selected, getTaskFromTaskBase(
          {
            id: randomInt(),
            label,
            taskType: type,
            options: options.map(option => ({ id: randomInt(), label: option })),
            user,
            asset
            //  meter
          })
        ]);
        navigation.goBack();
      }}><Text
        variant='titleMedium'>{t('add')}
      </Text></Pressable>
    });
  }, [label, type, user, asset, options]);
  return (<ScrollView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
    <Text style={{
      paddingHorizontal: 15,
      marginVertical: 10
    }}>{t('select_task_type')}</Text>
    <View>{
      getTaskTypes(t).map(taskType => (
        <TouchableOpacity onPress={() => setType(taskType.value)}
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            paddingHorizontal: 15
                          }}>
          <RadioButton
            value='first'
            status={type === taskType.value ? 'checked' : 'unchecked'}
            onPress={() => setType(taskType.value)}
          />
          <Text>{t(taskType.label)}</Text></TouchableOpacity>))}
    < /View>
    <Text style={{
      paddingHorizontal: 15,
      marginVertical: 10
    }}>{t('enter_task_name')}</Text>
    <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
      <TextInput
        onChangeText={(value) => setLabel(value)}
        mode={'outlined'}
        value={label}
      />
    </View>
    {type === 'MULTIPLE' && <Fragment><Text style={{
      paddingHorizontal: 15,
      marginVertical: 10
    }}>{t('add_options')}</Text>
      <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
        {options.map((option, index) => <View
          style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>< TextInput
          style={{ width: index < 2 ? '100%' : '80%' }}
          onChangeText={value => onOptionChange(value, index)}
          mode={'outlined'}
          value={option}
        />{index > 1 &&
        <IconButton onPress={() => onRemoveOption(index)} icon={'close-circle'} iconColor={theme.colors.error} />}
        </View>)}
        <Button style={{ marginTop: 10 }} mode={'contained'} onPress={onAddNewOption}>{t('add_new_option')}</Button>
      </View>
    </Fragment>}
    <Text style={{
      paddingHorizontal: 15,
      marginVertical: 10
    }}>{t('optional')}</Text>
    <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
      <List.Item
        title={t('assign_user')}
        descriptionStyle={{ color: theme.colors.primary }}
        description={user ? `${user.firstName} ${user.lastName}` : null}
        left={() => <List.Icon icon={'account'} />}
        onPress={() => navigation.navigate('SelectUsers', {
          onChange: (users) => setUser(users[0]),
          selected: [],
          multiple: false
        })} />
      <Divider />
      <List.Item
        title={t('assign_asset')}
        descriptionStyle={{ color: theme.colors.primary }}
        description={asset ? asset.name : null}
        left={() => <List.Icon icon={'package-variant-closed'} />}
        onPress={() => navigation.navigate('SelectAssets', {
          onChange: (assets) => setAsset(assets[0]),
          selected: [],
          multiple: false
        })} />
      <Divider />
    </View>
  </ScrollView>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
