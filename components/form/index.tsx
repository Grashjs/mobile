import { Text } from '../Themed';
import { StyleSheet, View } from 'react-native';
import { IField, IHash } from '../../models/form';
import { ObjectSchema } from 'yup';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Fragment } from 'react';

interface OwnProps {
  fields: Array<IField>;
  values?: IHash<any>;
  onSubmit?: (values: IHash<any>) => Promise<any>;
  onCanceled?: () => void;
  onChange?: any;
  submitText?: string;
  validation?: ObjectSchema<any>;
  isLoading?: boolean;
  isButtonEnabled?: (values: IHash<any>, ...props: any[]) => boolean;
}

export default function Form(props: OwnProps) {
  const { t } = useTranslation();
  const shape: IHash<any> = {};
  props.fields.forEach((f) => {
    shape[f.name] = Yup.string();
    if (f.required) {
      shape[f.name] = shape[f.name].required();
    }
  });
  const handleChange = (formik: FormikProps<IHash<any>>, field, e) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    props.onChange && props.onChange({ field, e });
    if (props.fields.length == 1) {
      formik.setFieldTouched(field, true);
    }
    formik.setFieldValue(field, e);
    return formik.handleChange(field);
  };
  const validationSchema = Yup.object().shape(shape);
  return (
    <View style={styles.container}>
      <Formik<IHash<any>>
        validationSchema={props.validation || validationSchema}
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={props.values || {}}
        onSubmit={(
          values,
          { resetForm, setErrors, setStatus, setSubmitting }
        ) => {
          setSubmitting(true);
          props.onSubmit(values).finally(() => {
            // resetForm();
            setStatus({ success: true });
            setSubmitting(false);
          });
        }}
      >
        {(formik) => (
          <View>
            {props.fields.map((field, index) =>
              <View key={index} style={{ marginTop: 10, width: '100%' }}>
                {field.type === 'text' &&
                <View style={{ width: '100%', alignItems: 'stretch' }}>
                  <TextInput style={{ width: '100%' }} mode='outlined'
                             error={!!formik.errors[field.name] || field.error}
                             label={field.label}
                             placeholder={field.placeholder ?? field.label}
                             onBlur={formik.handleBlur(field.name)}
                             onChangeText={(text) => handleChange(formik, field.name, text)}
                             value={formik.values[field.name]}
                             disabled={formik.isSubmitting}
                             multiline={field.multiple}
                  />
                  <HelperText type='error'
                              visible={Boolean(formik.errors[field.name])}>{t(formik.errors[field.name]?.toString())}</HelperText>
                </View>}
              </View>
            )}
            < Button
              style={{ marginTop: 20, zIndex: 10 }}
              onPress={() => formik.handleSubmit()}
              mode='contained'
              loading={
                formik.isSubmitting
              }
              disabled={Boolean(formik.errors.submit) || formik.isSubmitting}
            >
              {t(props.submitText)}
            </Button>
          </View>
        )}</Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  }
});
