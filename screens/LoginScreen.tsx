import { ScrollView, StyleSheet } from 'react-native';
import * as Yup from 'yup';
import { View } from '../components/Themed';
import { AuthStackScreenProps } from '../types';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { phoneRegExp } from '../utils/validators';
import useAuth from '../hooks/useAuth';
import { IS_LOCALHOST } from '../config';
import { useState } from 'react';
import { Button, Checkbox, HelperText, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';

export default function LoginScreen({ navigation }: AuthStackScreenProps<'Login'>) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [snackBarMessage, setSnackBarMessage] = useState<string>('');
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);
  const showSnackBar = (text: string, type: 'error' | 'success') => {
    setSnackBarMessage(text);
    setVisibleSnackBar(true);
  };
  const onDismissSnackBar = () => setVisibleSnackBar(false);
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Snackbar
        visible={visibleSnackBar}
        onDismiss={onDismissSnackBar}
      >
        {snackBarMessage}
      </Snackbar>
      <ScrollView style={styles.scrollView}>
        <Formik
          initialValues={{
            email: '',
            password: '',
            submit: null,
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string()
              .email(t('invalid_email'))
              .max(255)
              .required(t('required_email')),
            password: Yup.string().max(255).required(t('required_password')),
          })}
          onSubmit={async (
            values,
            { setErrors, setStatus, setSubmitting },
          ): Promise<void> => {
            setSubmitting(true);
            return login(values.email, values.password)
              .catch((err) => {
                showSnackBar(t('wrong_credentials'), 'error');
                setStatus({ success: false });
              })
              .finally(() => {
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
                error={Boolean(touched.email && errors.email)}
                label={t('email')}
                onBlur={handleBlur('email')}
                onChangeText={handleChange('email')}
                value={values.email}
                mode='outlined'
              />
              <HelperText type='error'
                          visible={Boolean(touched.email && errors.email)}>{errors.email?.toString()}</HelperText>
              <TextInput
                error={Boolean(touched.password && errors.password)}
                label={t('password')}
                onBlur={handleBlur('password')}
                onChangeText={handleChange('password')}
                value={values.password}
                mode='outlined'
              />
              <HelperText type='error'
                          visible={Boolean(touched.password && errors.password)}>{errors.password?.toString()}</HelperText>
              <Button
                color={theme.colors.primary}
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                disabled={isSubmitting}
                mode='contained'
              >
                {t('login')}
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
  scrollView: {
    marginVertical: 20,
    paddingHorizontal: 10,
    width: '90%',
  },
  checkboxContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  }, row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
