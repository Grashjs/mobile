import { RootStackScreenProps } from '../../types';
import { View } from '../../components/Themed';
import Form from '../../components/form';
import * as Yup from 'yup';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IField } from '../../models/form';
import { useContext, useState } from 'react';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import { formatSelect, formatSelectMultiple } from '../../utils/formatters';
import { getImageAndFiles } from '../../utils/overall';
import { useDispatch } from '../../store';
import { addWorkOrder } from '../../slices/workOrder';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { formatRequestValues, getWorkOrderFields } from '../../utils/fields';
import useAuth from '../../hooks/useAuth';
import { getWOBaseFields } from '../../utils/woBase';
import { addRequest } from '../../slices/request';

export default function CreateRequestScreen({
  navigation,
  route
}: RootStackScreenProps<'AddRequest'>) {
  const { t } = useTranslation();
  const { uploadFiles, getRequestFieldsAndShapes } = useContext(
    CompanySettingsContext
  );
  const { companySettings } = useAuth();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const dispatch = useDispatch();
  const onCreationSuccess = () => {
    showSnackBar(t('request_create_success'), 'success');
    navigation.goBack();
  };
  const onCreationFailure = (err) =>
    showSnackBar(t('request_create_failure'), 'error');

  return (
    <View style={styles.container}>
      <Form
        fields={getRequestFieldsAndShapes()[0]}
        validation={Yup.object().shape(getRequestFieldsAndShapes()[1])}
        navigation={navigation}
        submitText={t('save')}
        values={{ dueDate: null }}
        onChange={({ field, e }) => {}}
        onSubmit={async (values) => {
          let formattedValues = formatRequestValues(values);
          return new Promise<void>((resolve, rej) => {
            uploadFiles(formattedValues.files, formattedValues.image)
              .then((files) => {
                const imageAndFiles = getImageAndFiles(files);
                formattedValues = {
                  ...formattedValues,
                  image: imageAndFiles.image,
                  files: imageAndFiles.files
                };
                dispatch(addRequest(formattedValues))
                  .then(onCreationSuccess)
                  .catch(onCreationFailure)
                  .finally(resolve);
              })
              .catch((err) => {
                onCreationFailure(err);
                rej(err);
              });
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
