import { StyleSheet } from 'react-native';
import { View } from '../components/Themed';
import PDFReader from 'rn-pdf-reader-js';
import { RootStackScreenProps } from '../types';
import { useEffect } from 'react';

export default function PdfViewer({
  navigation,
  route
}: RootStackScreenProps<'PDFViewer'>) {
  useEffect(() => {
    navigation.setOptions({
      title: route.params.title
    });
  }, [route]);
  return (
    <View style={styles.container}>
      <PDFReader
        style={{ height: '100%', width: '100%' }}
        source={{
          uri: route.params.uri
        }}
      />
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
