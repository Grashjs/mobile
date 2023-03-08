import { RootStackScreenProps } from '../../types';
import { View } from '../../components/Themed';
import Form from '../../components/form';
import * as Yup from 'yup';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { CompanySettingsContext } from '../../contexts/CompanySettingsContext';
import { getImageAndFiles } from '../../utils/overall';
import { useDispatch } from '../../store';
import { editRequest } from '../../slices/request';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { formatRequestValues } from '../../utils/fields';
import { getWOBaseValues } from '../../utils/woBase';

export default function EditRequestScreen({
                                            navigation,
                                            route
                                          }: RootStackScreenProps<'EditRequest'>) {
  const { t } = useTranslation();
  const { request } = route.params;
  const { uploadFiles, getRequestFieldsAndShapes } = useContext(
    CompanySettingsContext
  );

  const { showSnackBar } = useContext(CustomSnackBarContext);
  const dispatch = useDispatch();

  const onEditSuccess = () => {
    showSnackBar(t('changes_saved_success'), 'success');
    navigation.goBack();
  };
  const onEditFailure = (err) =>
    showSnackBar(t('request_edit_failure'), 'error');

  return (<View style={styles.container}>
    <Form
      fields={getRequestFieldsAndShapes()[0]}
      validation={Yup.object().shape(getRequestFieldsAndShapes()[1])}
      navigation={navigation}
      submitText={t('save')}
      values={{
        ...request,
        ...getWOBaseValues(t, request)
      }}
      onChange={({ field, e }) => {
      }}
      onSubmit={async (values) => {
        let formattedValues = formatRequestValues(values);
        return new Promise<void>((resolve, rej) => {
          const files = formattedValues.files.find((file) => file.id)
            ? []
            : formattedValues.files;
          uploadFiles(files, formattedValues.image)
            .then((files) => {
              const imageAndFiles = getImageAndFiles(
                files,
                request.image
              );
              formattedValues = {
                ...formattedValues,
                image: imageAndFiles.image,
                files: [...request.files, ...imageAndFiles.files]
              };
              dispatch(editRequest(request?.id, formattedValues))
                .then(onEditSuccess)
                .catch(onEditFailure)
                .finally(resolve);
            })
            .catch((err) => {
              onEditFailure(err);
              rej(err);
            });
        });
      }} /></View>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
