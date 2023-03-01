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
import { getWorkOrderFields } from '../../utils/fields';

export default function CreateWorkOrderScreen({
                                                navigation,
                                                route
                                              }: RootStackScreenProps<'AddWorkOrder'>) {
  const { t } = useTranslation();
  const [initialDueDate, setInitialDueDate] = useState<Date>(null);
  const { uploadFiles, getWOFieldsAndShapes } = useContext(
    CompanySettingsContext
  );
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const dispatch = useDispatch();
  const defaultShape: { [key: string]: any } = {
    title: Yup.string().required(t('required_wo_title'))
  };
  const formatValues = (values) => {
    values.primaryUser = formatSelect(values.primaryUser);
    values.location = formatSelect(values.location);
    values.team = formatSelect(values.team);
    values.asset = formatSelect(values.asset);
    values.assignedTo = formatSelectMultiple(values.assignedTo);
    values.customers = formatSelectMultiple(values.customers);
    values.priority = values.priority ? values.priority.value : 'NONE';
    values.requiredSignature = Array.isArray(values.requiredSignature)
      ? values?.requiredSignature.includes('on')
      : values.requiredSignature;
    values.category = formatSelect(values.category);
    return values;
  };
  const onCreationSuccess = () => {
    showSnackBar(t('wo_create_success'), 'success');
    navigation.goBack();
  };
  const onCreationFailure = (err) =>
    showSnackBar(t('wo_create_failure'), 'error');
  const getFieldsAndShapes = (): [Array<IField>, { [key: string]: any }] => {
    return getWOFieldsAndShapes(getWorkOrderFields(t), defaultShape);
  };
  return (<View style={styles.container}>
    <Form
      fields={getFieldsAndShapes()[0]}
      validation={Yup.object().shape(getFieldsAndShapes()[1])}
      navigation={navigation}
      submitText={t('save')}
      values={{
        requiredSignature: false,
        dueDate: initialDueDate
      }}
      onChange={({ field, e }) => {
      }}
      onSubmit={async (values) => {
        let formattedValues = formatValues(values);
        return new Promise<void>((resolve, rej) => {
          uploadFiles(formattedValues.files, formattedValues.image)
            .then((files) => {
              const imageAndFiles = getImageAndFiles(files);
              formattedValues = {
                ...formattedValues,
                image: imageAndFiles.image,
                files: imageAndFiles.files
              };
              dispatch(addWorkOrder(formattedValues))
                .then(() => {
                  onCreationSuccess();
                  resolve();
                })
                .catch((err) => {
                  onCreationFailure(err);
                  rej();
                });
            })
            .catch((err) => {
              onCreationFailure(err);
              rej();
            });
        });
      }} /></View>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
