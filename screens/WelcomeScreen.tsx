import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { Text, View } from '../components/Themed';
import { AuthStackScreenProps } from '../types';
import { useTranslation } from 'react-i18next';

export default function WelcomeScreen({
  navigation
}: AuthStackScreenProps<'Welcome'>) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atlas</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Button mode="contained" onPress={() => navigation.navigate('Register')}>
        {t('register')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
});
