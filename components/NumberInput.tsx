import { useState } from 'react';
import { TextInput } from 'react-native-paper';

export default function NumberInput(props: {
  style: any;
  mode: 'flat' | 'outlined';
  error: boolean;
  label: string;
  defaultValue: string;
  placeholder: string;
  onBlur: (e) => void;
  onChangeText: (value: string) => void;
  disabled: boolean;
  multiline: boolean
}) {
  const [numberInputValue, setNumberInputValue] = useState<number>(Number(props.defaultValue));
  return (
    <TextInput {...props} value={numberInputValue.toString()} onChangeText={(newValue) => {
      const formattedValue = Number(newValue.replace(/[^0-9]/g, ''));
      setNumberInputValue(formattedValue);
      props.onChangeText(formattedValue.toString());
    }} />
  );
}
