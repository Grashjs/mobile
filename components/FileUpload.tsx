import { View } from './Themed';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentResult } from 'expo-document-picker';
import * as React from 'react';
import * as FileSystem from 'expo-file-system';
import { useContext, useRef, useState } from 'react';
import * as Permissions from 'expo-permissions';
import { Alert, Image, PermissionsAndroid, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Divider, List, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import mime from 'mime';
import { IconSource } from 'react-native-paper/src/components/Icon';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { CustomSnackBarContext } from '../contexts/CustomSnackBarContext';

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
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const { t } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const maxFileSize: number = 7;
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
          Alert.alert(t('error'), t('PERMISSION_ACCESS_FILE'));

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

  const getFileInfo = async (fileURI: string) => {
    const fileInfo = await FileSystem.getInfoAsync(fileURI);
    return fileInfo;
  };
  const isMoreThanTheMB = (fileSize: number, limit: number) => {
    return fileSize / 1024 / 1024 > limit;
  };
  const takePhoto = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === 'granted') {
      try {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsMultipleSelection: multiple,
          selectionLimit: 10,
          quality: 1
        });
        onImagePicked(result);
      } catch (e) {
        console.error(e);
      }
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
        quality: 1
      });
      onImagePicked(result);
    }
  };
  const checkSize = async (uri: string) => {
    const fileInfo = await getFileInfo(uri);

    if (!fileInfo?.size) {
      Alert.alert('Can\'t select this file as the size is unknown.');
      throw new Error();
    }
    if (isMoreThanTheMB(fileInfo.size, maxFileSize)) {
      showSnackBar(t('max_file_size_error', { size: maxFileSize }), 'error');
      throw new Error(t('max_file_size_error', { size: maxFileSize }));
    }
  };
  const onImagePicked = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled) {
      for (const asset of result.assets) {
        const { uri } = asset;
        checkSize(uri);
      }
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
  };
  const pickFile = async () => {
    const hasPermissions = await checkPermissions();
    if (hasPermissions) {
      let result = await DocumentPicker.getDocumentAsync({});
      if (result.type !== 'cancel') {
        checkSize(result.uri);
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
    if (type === 'image') actionSheetRef.current.show();
    else pickFile();
  };
  const renderActionSheet = () => {
    const options: {
      title: string;
      icon: IconSource;
      onPress: () => void;
    }[] = [
      {
        title: t('library'),
        icon: 'image-multiple',
        onPress: pickImage
      },
      {
        title: t('camera'),
        icon: 'camera',
        //TODO
        onPress: takePhoto
      }
    ];

    return (
      <ActionSheet ref={actionSheetRef}>
        <View style={{ padding: 15 }}>
          <Divider />
          <List.Section>
            {options.map((entity, index) => (
              <List.Item
                key={index}
                title={entity.title}
                left={() => (
                  <List.Icon icon={entity.icon} />
                )}
                onPress={entity.onPress}
              />
            ))}
          </List.Section>
        </View>
      </ActionSheet>
    );
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
      {renderActionSheet()}
    </View>
  );
}
