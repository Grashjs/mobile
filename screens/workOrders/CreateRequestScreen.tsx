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
import useAuth from '../../hooks/useAuth';
import { getWOBaseFields } from '../../utils/woBase';
import { addRequest } from '../../slices/request';

export default function CreateRequestScreen({
                                              navigation,
                                              route
                                            }: RootStackScreenProps<'AddWorkOrder'>) {
  const { t } = useTranslation();
  const [initialDueDate, setInitialDueDate] = useState<Date>(null);
  const { uploadFiles, getWOFieldsAndShapes } = useContext(
    CompanySettingsContext
  );
  const {
    companySettings,
    hasCreatePermission,
    getFilteredFields
  } = useAuth();
  const { workOrderRequestConfiguration } = companySettings;
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const dispatch = useDispatch();
  const onCreationSuccess = () => {
    showSnackBar(t('request_create_success'), 'success');
  };
  const onCreationFailure = (err) =>
    showSnackBar(t('request_create_failure'), 'error');
  const formatValues = (values) => {
    values.primaryUser = formatSelect(values.primaryUser);
    values.location = formatSelect(values.location);
    values.team = formatSelect(values.team);
    values.asset = formatSelect(values.asset);
    values.assignedTo = formatSelectMultiple(values.assignedTo);
    values.priority = values.priority?.value;
    values.category = formatSelect(values.category);
    return values;
  };
  const defaultFields: Array<IField> = [...getWOBaseFields(t)];
  const defaultShape = {
    title: Yup.string().required(t('required_request_name'))
  };
  const getFieldsAndShapes = (): [Array<IField>, { [key: string]: any }] => {
    let fields = [...getFilteredFields(defaultFields)];
    let shape = { ...defaultShape };
    const fieldsToConfigure = [
      'asset',
      'location',
      'primaryUser',
      'category',
      'dueDate',
      'team'
    ];
    fieldsToConfigure.forEach((name) => {
      const fieldConfig =
        workOrderRequestConfiguration.fieldConfigurations.find(
          (fc) => fc.fieldName === name
        );
      const fieldIndexInFields = fields.findIndex(
        (field) => field.name === name
      );
      if (fieldConfig.fieldType === 'REQUIRED') {
        fields[fieldIndexInFields] = {
          ...fields[fieldIndexInFields],
          required: true
        };
        const requiredMessage = t('required_field');
        let yupSchema;
        switch (fields[fieldIndexInFields].type) {
          case 'text':
            yupSchema = Yup.string().required(requiredMessage);
            break;
          case 'date':
            yupSchema = Yup.string().required(requiredMessage);
            break;
          case 'number':
            yupSchema = Yup.number().required(requiredMessage);
            break;
          default:
            yupSchema = Yup.object().required(requiredMessage).nullable();
            break;
        }
        shape[name] = yupSchema;
      } else if (fieldConfig.fieldType === 'HIDDEN') {
        fields.splice(fieldIndexInFields, 1);
      }
    });

    return [fields, shape];
  };

  return (<View style={styles.container}>
    <Form
      fields={getFieldsAndShapes()[0]}
      validation={Yup.object().shape(getFieldsAndShapes()[1])}
      navigation={navigation}
      submitText={t('save')}
      values={{ dueDate: null }}
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
      }} /></View>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
