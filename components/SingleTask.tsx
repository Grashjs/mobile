import { Task, TaskOption, TaskType } from '../models/tasks';
import { View } from './Themed';
import { useTheme, Text, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import useAuth from '../hooks/useAuth';
import debounce from 'lodash.debounce';
import MultiSelect from 'react-native-multiple-select';

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
      <Text variant='titleMedium'>
        {task.taskBase.label || `<${t('enter_task_name')}>`}
      </Text>
      {['SUBTASK', 'INSPECTION', 'MULTIPLE'].includes(
        task.taskBase.taskType
      ) ? (
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
    </View>
  );
}
