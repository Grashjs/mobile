import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { View } from '../../components/Themed';
import { AuthStackScreenProps, RootTabScreenProps } from '../../types';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native-paper';

export default function VerifyScreen({ navigation }: AuthStackScreenProps<'Welcome'>) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text variant='labelLarge'>{t('verify_email_description')}</Text>
      <Button style={{ marginTop: 20 }} mode='contained' onPress={() => navigation.navigate('Login')}
      >{t('login')}</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30
  }
});
