import { View } from './Themed';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import * as Permissions from 'expo-permissions';
import {
  Alert,
  Image,
  PermissionsAndroid,
  ScrollView,
  Text,
  TouchableOpacity
} from 'react-native';
import { DocumentResult } from 'expo-document-picker';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import mime from 'mime';

interface OwnProps {
  title: string;
  type: 'image' | 'file' | 'spreadsheet';
  multiple: boolean;
  description: string;
  onChange: (files: { uri: string; name: string; type: string }[]) => void;
}

export default function FileUpload({
  title,
  type,
  multiple,
  onChange
}: OwnProps) {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState<DocumentResult>();
  const theme = useTheme();
  const { t } = useTranslation();
  const checkPermissions = async () => {
    try {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );

      if (!result) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title:
              'You need to give storage permission to download and save the file',
            message: 'App needs access to your camera ',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK'
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the camera');
          return true;
        } else {
          Alert.alert('Error', t('PERMISSION_ACCESS_FILE'));

          console.log('Camera permission denied');
          return false;
        }
      } else {
        return true;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    if (status === 'granted') {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: multiple,
        selectionLimit: 10,
        quality: 1,
        base64: true
      });

      if (!result.canceled) {
        setImages(result.assets.map((asset) => asset.uri));
        onChange(
          result.assets.map((asset) => {
            const fileName =
              asset.uri.split('/')[asset.uri.split('/').length - 1];
            return {
              uri: asset.uri,
              name: fileName,
              type: mime.getType(fileName)
            };
          })
        );
      }
    }
  };
  const pickFile = async () => {
    const hasPermissions = await checkPermissions();
    if (hasPermissions) {
      let result = await DocumentPicker.getDocumentAsync({});
      if (result.type !== 'cancel') {
        setFile(result);
        onChange([
          {
            uri: result.uri,
            name: result.name,
            type: mime.getType(result.name)
          }
        ]);
      }
    }
  };
  const onPress = () => {
    if (type === 'image') pickImage();
    else pickFile();
  };
  return (
    <View style={{ display: 'flex', flexDirection: 'column' }}>
      <TouchableOpacity onPress={onPress}>
        <Text>{title}</Text>
      </TouchableOpacity>
      <ScrollView>
        {type === 'image' &&
          !!images.length &&
          images.map((image) => (
            <Image source={{ uri: image }} style={{ height: 200 }} />
          ))}
        {type === 'file' && file && file?.type !== 'cancel' && (
          <Text style={{ color: theme.colors.primary }}>{file.name}</Text>
        )}
      </ScrollView>
    </View>
  );
}
