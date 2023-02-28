import { View } from './Themed';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity } from 'react-native';
import { DocumentResult } from 'expo-document-picker';

interface OwnProps {
  title: string;
  type: 'image' | 'file' | 'spreadsheet';
  multiple: boolean;
  description: string;
  onChange: (files: any) => void;
}

export default function FileUpload({ title, type, multiple, onChange }: OwnProps) {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState<DocumentResult>();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: multiple,
      selectionLimit: 10,
      quality: 1,
      base64: true
    });

    if (!result.canceled) {
      setImages(result.assets.map(asset => asset.uri));
      const newImages = await Promise.all(result.assets.map(async asset => {
        const response = await fetch(asset.uri);
        return await response.blob();
      }));
      onChange(newImages);
    }
  };
  const pickFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type !== 'cancel') {
      setFile(result);
      const response = await fetch(result.uri);
      onChange([await response.blob()]);
    }
    ;
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
        {type === 'image' && !!images.length && images.map(image => <Image source={{ uri: image }}
                                                                           style={{ height: 200 }} />)}
        {type === 'file' && file && file?.type !== 'cancel' && <Text>{file.name}</Text>}
      </ScrollView></View>
  );
}
