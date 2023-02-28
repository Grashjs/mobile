import { View } from './Themed';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity } from 'react-native';

interface OwnProps {
  title: string;
  type: 'image' | 'file' | 'spreadsheet';
  multiple: boolean;
  description: string;
  onChange: (files: any) => void;
}

export default function FileUpload({ title, type, multiple, onChange }: OwnProps) {
  const [images, setImages] = useState([]);

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
  return (
    <View style={{ display: 'flex', flexDirection: 'column' }}>
      <TouchableOpacity onPress={pickImage}>
        <Text>{title}</Text>
      </TouchableOpacity>
      <ScrollView>
        {!!images.length && images.map(image => <Image source={{ uri: image }} style={{ height: 200 }} />)}
      </ScrollView></View>
  );
}
