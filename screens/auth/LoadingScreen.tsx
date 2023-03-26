import { StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { View } from '../../components/Themed';

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
