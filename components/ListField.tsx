import { RootStackParamList } from '../types';
import { View } from './Themed';
import { Divider, Text, useTheme } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ListField<T>({
  values,
  label,
  getHref,
  getValueLabel
}: {
  values: T[];
  label: string;
  getHref: (value: T) => { route: keyof RootStackParamList; params: {} };
  getValueLabel: (value: T) => string;
}) {
  const theme = useTheme();
  const navigation = useNavigation();
  return (
    !!values?.length && (
      <View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 20
          }}
        >
          <Text>{label}</Text>
          <View>
            {values.map((value, index) => (
              <TouchableOpacity
                style={{ marginTop: 5 }}
                key={index}
                onPress={() =>
                  // @ts-ignore
                  navigation.push(getHref(value).route, getHref(value).params)
                }
              >
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: theme.colors.primary
                  }}
                >
                  {getValueLabel(value)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Divider />
      </View>
    )
  );
}
