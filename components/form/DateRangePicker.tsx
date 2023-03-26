import { View } from '../Themed';
import CustomDateTimePicker from '../CustomDateTimePicker';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';

interface OwnProps {
  value: [string, string];
  onChange: (dates: [string, string]) => void;
}

export default function DateRangePicker({ value, onChange }: OwnProps) {
  const { t } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const onChangeInternal = (date, index: number) => {
    let valueClone: [string, string] = [...value];
    valueClone[index] = date;
    onChange(valueClone);
  };
  return (
    <View>
      <CustomDateTimePicker
        label={t('start')}
        onChange={(date) => {
          if (!value[1] || new Date(date) < new Date(value[1])) {
            onChangeInternal(date, 0);
          } else showSnackBar(t('end_cannot_be_ulterior_to_start'), 'error');
        }}
        value={value[0] ? new Date(value[0]) : null}
      />
      <CustomDateTimePicker
        label={t('end')}
        onChange={(date) => {
          if (!value[0] || new Date(date) > new Date(value[0])) {
            onChangeInternal(date, 1);
          } else showSnackBar(t('end_cannot_be_ulterior_to_start'), 'error');
        }}
        value={value[1] ? new Date(value[1]) : null}
      />
    </View>
  );
}
