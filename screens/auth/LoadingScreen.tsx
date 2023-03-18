import { StyleSheet } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';

import { View } from '../../components/Themed';
import { AuthStackScreenProps, RootTabScreenProps } from '../../types';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native-paper';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
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
