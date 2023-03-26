import { TaskType } from '../models/tasks';
import { UserMiniDTO } from '../models/user';

export const enumerate = (array: string[]) =>
  array.reduce(
    (acc, value, index) => acc + `${index !== 0 ? ',' : ''} ${value}`,
    ''
  );

export const getTaskTypes = (t) => {
  const taskTypes: { label: string; value: TaskType }[] = [
    { label: t('sub_task_status'), value: 'SUBTASK' },
    { label: t('text_field'), value: 'TEXT' },
    { label: t('number_field'), value: 'NUMBER' },
    { label: t('inspection_check'), value: 'INSPECTION' },
    { label: t('multiple_choices'), value: 'MULTIPLE' },
    { label: t('meter_reading'), value: 'METER' }
  ];
  return taskTypes;
};

export const getUserInitials = (user: UserMiniDTO) => {
  return `${user.firstName.charAt(0).toUpperCase()}${user.lastName
    .charAt(0)
    .toUpperCase()}`;
};
