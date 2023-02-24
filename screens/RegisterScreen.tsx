import { ScrollView, StyleSheet } from 'react-native';
import * as Yup from 'yup';
import { Text, View } from '../components/Themed';
import { AuthStackScreenProps } from '../types';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { phoneRegExp } from '../utils/validators';
import useAuth from '../hooks/useAuth';
import { IS_LOCALHOST } from '../config';
import { useContext, useState } from 'react';
import { CustomSnackBarContext } from '../contexts/CustomSnackBarContext';
import { Button, Checkbox, Snackbar, TextInput, useTheme } from 'react-native-paper';

export default function RegisterScreen({ navigation }: AuthStackScreenProps<'Register'>) {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [snackBarMessage, setSnackBarMessage] = useState<string>('');
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);
  const showSnackBar = (text: string, type: 'error' | 'success') => {
    setSnackBarMessage(text);
    setVisibleSnackBar(true);
  };

  const onDismissSnackBar = () => setVisibleSnackBar(false);
  const theme = useTheme();
  const getFieldsAndShapes = (): [
    { [key: string]: any },
    { [key: string]: any }
  ] => {
    let fields = {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      companyName: '',
      employeesCount: 5,
      terms: false,
      submit: null,
    };
    let shape = {
      email: Yup.string()
        .email(t('invalid_email'))
        .max(255)
        .required(t('required_email')),
      firstName: Yup.string().max(255).required(t('required_firstName')),
      lastName: Yup.string().max(255).required(t('required_lastName')),
      companyName: Yup.string().max(255).required(t('required_company')),
      employeesCount: Yup.number()
        .min(0)
        .required(t('required_employeesCount')),
      phone: Yup.string().matches(phoneRegExp, t('invalid_phone')),
      password: Yup.string().min(8).max(255).required(t('required_password')),
      terms: Yup.boolean().oneOf([true], t('required_terms')),
    };
    // if (role) {
    //   const keysToDelete = ['companyName', 'employeesCount'];
    //   keysToDelete.forEach((key) => {
    //     delete fields[key];
    //     delete shape[key];
    //   });
    // }
    return [fields, shape];
  };
  return (
    <View style={styles.container}>
      <Snackbar
        visible={visibleSnackBar}
        onDismiss={onDismissSnackBar}
      >
        {snackBarMessage}
      </Snackbar>
      <ScrollView>
        <Formik
          initialValues={getFieldsAndShapes()[0]}
          validationSchema={Yup.object().shape(getFieldsAndShapes()[1])}
          onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
            setSubmitting(true);
            return register(values)
              .then(() => {
                if (!IS_LOCALHOST) {
                  showSnackBar(t('verify_email'), 'success');
                  navigation.navigate('Verify');
                }
              })
              .catch((err) => {
                showSnackBar(t('registration_error'), 'error');
              })
              .finally(() => {
                setStatus({ success: true });
                setSubmitting(false);
              });
          }}
        >
          {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values,
              setFieldValue,
            }) => (
            <View>
              <TextInput
                error={Boolean(touched.firstName && errors.firstName)}
                label={t('first_name')}
                onBlur={handleBlur('firstName')}
                onChangeText={handleChange('firstName')}
                value={values.firstName}
                mode='outlined'
              />
              <Text>{errors.firstName?.toString()}</Text>
              <TextInput
                error={Boolean(touched.lastName && errors.lastName)}
                label={t('last_name')}
                onBlur={handleBlur('lastName')}
                onChangeText={handleChange('lastName')}
                value={values.lastName}
                mode='outlined'
              />
              <Text>{errors.lastName?.toString()}</Text>
              <TextInput
                error={Boolean(touched.email && errors.email)}
                label={t('email')}
                onBlur={handleBlur('email')}
                onChangeText={handleChange('email')}
                value={values.email}
                mode='outlined'
              />
              <Text>{errors.email?.toString()}</Text>
              <TextInput
                error={Boolean(touched.phone && errors.phone)}
                label={t('phone')}
                onBlur={handleBlur('phone')}
                onChangeText={handleChange('phone')}
                value={values.phone}
                mode='outlined'
              />
              <Text>{errors.phone?.toString()}</Text>
              <TextInput
                error={Boolean(touched.password && errors.password)}
                label={t('password')}
                onBlur={handleBlur('password')}
                onChangeText={handleChange('password')}
                value={values.password}
                mode='outlined'
              />
              <Text>{errors.password?.toString()}</Text>
              <TextInput
                error={Boolean(touched.companyName && errors.companyName)}
                label={t('companyName')}
                onBlur={handleBlur('companyName')}
                onChangeText={handleChange('companyName')}
                value={values.companyName}
                mode='outlined'
              />
              <Text>{errors.companyName?.toString()}</Text>
              <TextInput
                error={Boolean(
                  touched.employeesCount && errors.employeesCount,
                )}
                label={t('employeesCount')}
                onBlur={handleBlur('employeesCount')}
                onChangeText={handleChange('employeesCount')}
                value={values.employeesCount}
                mode='outlined'
              />
              <Text>{errors.employeesCount?.toString()}</Text>
              <Checkbox
                status={values.terms ? 'checked' : 'unchecked'}
                color={theme.colors.primary}
                onPress={(event) => setFieldValue('terms', !values.terms)}
              />
              <Text>{errors.terms?.toString()}</Text>
              <Button
                color={theme.colors.primary}
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                disabled={isSubmitting}
                mode='contained'
              >
                {t('create_your_account')}
              </Button>
            </View>
          )}
        </Formik>
      </ScrollView>
    </View>
  )
    ;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
