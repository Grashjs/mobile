import { Task, TaskOption, TaskType } from '../models/tasks';
import { View } from './Themed';
import { useTheme, Text, TextInput, IconButton, Divider, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import useAuth from '../hooks/useAuth';
import debounce from 'lodash.debounce';
import MultiSelect from 'react-native-multiple-select';
import { PermissionEntity } from '../models/role';
import { PlanFeature } from '../models/subscriptionPlan';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface SingleTaskProps {
  task: Task;
  preview?: boolean;
  handleChange?: (value: string | number, id: number) => void;
  handleSaveNotes?: (value: string, id: number) => Promise<void>;
  handleNoteChange?: (value: string, id: number) => void;
  handleSelectImages?: (id: number) => void;
  handleZoomImage?: (images: string[], image: string) => void;
  toggleNotes?: (id: number) => void;
  notes?: Map<number, boolean>;
}

export default function SingleTask({
                                     task,
                                     handleChange,
                                     handleNoteChange,
                                     handleSaveNotes,
                                     preview,
                                     toggleNotes,
                                     notes,
                                     handleSelectImages,
                                     handleZoomImage
                                   }: SingleTaskProps) {
  const theme = useTheme();
  const { t }: { t: any } = useTranslation();
  const [savingNotes, setSavingNotes] = useState<boolean>(false);
  const { user, hasCreatePermission, hasFeature } = useAuth();
  const [inputValue, setInputValue] = useState<string>('');
  const changeHandler = (newValue: string) => {
    if (!preview) {
      let formattedValue = newValue;
      if (task.taskBase.taskType === 'METER' || task.taskBase.taskType === 'NUMBER') {
        formattedValue = newValue?.replace(/[^0-9]/g, '') ?? '';
        setInputValue(formattedValue);
      } else setInputValue(formattedValue);
      if (formattedValue !== '') handleChange(formattedValue, task.id);
    }
  };

  const debouncedChangeHandler = useMemo(
    () => debounce(changeHandler, 1500),
    []
  );

  const subtaskOptions = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETE'];
  const inspectionOptions = ['PASS', 'FLAG', 'FAIL'
  ];

  const getOptions = (type: TaskType, options: TaskOption[]) => {
    switch (type) {
      case 'SUBTASK':
        return subtaskOptions.map(
          (status) => ({ value: status, label: t(status) })
        );
      case 'INSPECTION':
        return inspectionOptions.map(
          (option) => ({ value: option, label: t(option) })
        );
      case 'MULTIPLE':
        return options
          .map((option) => option.label)
          .map((option) => {
            return {
              label: option,
              value: option
            };
          });
      default:
        break;
    }
  };
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant='titleMedium'>
          {task.taskBase.label || `<${t('enter_task_name')}>`}
        </Text>
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <IconButton iconColor={theme.colors.primary} icon={'image'} onPress={() => handleSelectImages(task.id)}
                      disabled={
                        preview ||
                        !(hasCreatePermission(PermissionEntity.FILES) &&
                          hasFeature(PlanFeature.FILE))} />
          <IconButton iconColor={theme.colors.primary} icon={'note-outline'}
                      onPress={() => !preview && toggleNotes(task.id)} />
        </View>
      </View>
      {['SUBTASK', 'INSPECTION', 'MULTIPLE'].includes(
        task.taskBase.taskType
      ) ? (
        <View style={styles.shadowedSelect}>
          <MultiSelect
            selectedItems={[
              preview
                ? getOptions(task.taskBase.taskType, task.taskBase.options)[0]
                  .value
                : task.value]
            }
            selectText={t('select')}
            searchInputPlaceholderText={t('search')}
            uniqueKey='value'
            displayKey='label'
            searchInputStyle={{ color: '#CCC' }}
            submitButtonColor={theme.colors.primary}
            items={getOptions(task.taskBase.taskType, task.taskBase.options)}
            single
            onSelectedItemsChange={(items) => !preview && !(task.taskBase.user && task.taskBase.user.id !== user.id) && handleChange(items[0], task.id)
            } />
        </View>
      ) : (task.taskBase.taskType === 'METER' || task.taskBase.taskType === 'NUMBER') ? <TextInput
        defaultValue={task.value.toString()}
        onChangeText={changeHandler}
        label={t('value')}
        value={inputValue}
        mode={'outlined'}
        disabled={
          task.taskBase.user && task.taskBase.user.id !== user.id
        }
      /> : <TextInput
        defaultValue={task.value.toString()}
        onChangeText={debouncedChangeHandler}
        label={t('value')}
        mode={'outlined'}
        disabled={
          task.taskBase.user && task.taskBase.user.id !== user.id
        }
      />}
      {task.taskBase.asset && (
        <View style={{ marginVertical: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
        >
          <Text style={{ fontWeight: 'bold' }}>
            {t('concerned_asset')}
          </Text>
          <TouchableOpacity>
            <Text style={{ color: theme.colors.primary }}>{task.taskBase.asset.name}</Text>
          </TouchableOpacity>
        </View>
      )}
      {task.taskBase.user && (
        <View style={{ marginVertical: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
        >
          <Text style={{ fontWeight: 'bold' }}>
            {t('assigned_to')}
          </Text>
          <TouchableOpacity>
            <Text
              style={{ color: theme.colors.primary }}>{`${task.taskBase.user.firstName} ${task.taskBase.user.lastName}`}</Text>
          </TouchableOpacity>
        </View>
      )}
      {notes.get(task.id) && (
        <View>
          <TextInput mode={'outlined'} multiline value={task.notes} label={t('notes')}
                     onChangeText={(value) =>
                       !preview && handleNoteChange(value, task.id)
                     }
          />
          <Button
            style={{ marginTop: 10 }}
            mode='contained'
            loading={savingNotes}
            disabled={savingNotes}
            onPress={() => {
              setSavingNotes(true);
              handleSaveNotes(task.notes, task.id).finally(() =>
                setSavingNotes(false)
              );
            }}
          >
            {t('save')}
          </Button>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  shadowedSelect: {
    borderRadius: 7,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    marginHorizontal: 5,
    marginVertical: 5,
    elevation: 5
  }
});
