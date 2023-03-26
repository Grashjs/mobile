import { StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { View } from '../../components/Themed';
import { AuthStackScreenProps } from '../../types';
import { useTranslation } from 'react-i18next';

export default function VerifyScreen({
  navigation
}: AuthStackScreenProps<'Welcome'>) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text variant="labelLarge">{t('verify_email_description')}</Text>
      <Button
        style={{ marginTop: 20 }}
        mode="contained"
        onPress={() => navigation.navigate('Login')}
      >
        {t('login')}
      </Button>
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
