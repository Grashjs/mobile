import { Text } from '../Themed';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IField, IHash } from '../../models/form';
import * as Yup from 'yup';
import { ObjectSchema } from 'yup';
import { Button, HelperText, IconButton, TextInput, useTheme } from 'react-native-paper';
import { Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../types';
import { PartMiniDTO } from '../../models/part';
import { CustomerMiniDTO } from '../../models/customer';
import { VendorMiniDTO } from '../../models/vendor';
import { UserMiniDTO } from '../../models/user';
import { TeamMiniDTO } from '../../models/team';
import { AssetMiniDTO } from '../../models/asset';
import Category from '../../models/category';
import { LocationMiniDTO } from '../../models/location';
import FileUpload from '../FileUpload';
import { useState } from 'react';
import CustomDateTimePicker from '../CustomDateTimePicker';
import { Switch } from 'react-native-paper';
import PriorityPicker from './PriorityPicker';
import { Task } from '../../models/tasks';
import { getTaskTypes } from '../../utils/displayers';

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
  navigation: any;
}

export default function Form(props: OwnProps) {
  const { t } = useTranslation();
  const shape: IHash<any> = {};
  const theme = useTheme();
  const [numberInputValue, setNumberInputValue] = useState<number>(0);
  props.fields.forEach((f) => {
    shape[f.name] = Yup.string();
    if (f.required) {
      shape[f.name] = shape[f.name].required();
    }
  });
  const handleChange = (formik: FormikProps<IHash<any>>, field, e: { label: string, value: any }[] | string | number | Date | boolean | { label: string, value: any }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    props.onChange && props.onChange({ field, e });
    if (props.fields.length == 1) {
      formik.setFieldTouched(field, true);
    }
    formik.setFieldValue(field, e);
    return formik.handleChange(field);
  };
  const validationSchema = Yup.object().shape(shape);

  const renderSelect = (formik, field: IField) => {
    let values: { label: string; value: number }[] | { label: string; value: number } = formik.values[field.name];
    const excluded = field.excluded;
    let screenPath: keyof RootStackParamList;
    let onChange: (values: (PartMiniDTO | CustomerMiniDTO | VendorMiniDTO | UserMiniDTO | TeamMiniDTO | AssetMiniDTO | Category | Task)[]) => void;
    let additionalNavigationOptions = {};
    switch (field.type2) {
      case 'priority':
        return <View>
          <Text>{field.label}</Text>
          <PriorityPicker value={formik.values[field.name]}
                          onChange={(value) => handleChange(formik, field.name, value)} /></View>;
      case 'part':
        screenPath = 'SelectParts';
        onChange = (values: PartMiniDTO[]) => {
          const value = values.map(part => ({
            label: part.name,
            value: part.id
          }));
          handleChange(formik, field.name, field.multiple ? value : value[0]);
        };
        break;
      case 'customer':
        screenPath = 'SelectCustomers';
        onChange = (values: CustomerMiniDTO[]) => {
          const value = values.map(customer => ({
            label: customer.name,
            value: customer.id
          }));
          handleChange(formik, field.name, field.multiple ? value : value[0]);
        };
        break;
      case 'vendor':
        screenPath = 'SelectVendors';
        onChange = (values: VendorMiniDTO[]) => {
          const value = values.map(vendor => ({
            label: vendor.companyName,
            value: vendor.id
          }));
          handleChange(formik, field.name, field.multiple ? value : value[0]);
        };
        break;
      case 'user':
        screenPath = 'SelectUsers';
        onChange = (values: UserMiniDTO[]) => {
          const value = values.map(user => ({
            label: `${user.firstName} ${user.lastName}`,
            value: user.id
          }));
          handleChange(formik, field.name, field.multiple ? value : value[0]);
        };
        break;
      case 'team':
        screenPath = 'SelectTeams';
        onChange = (values: TeamMiniDTO[]) => {
          const value = values.map(team => ({
            label: team.name,
            value: team.id
          }));
          handleChange(formik, field.name, field.multiple ? value : value[0]);
        };
        break;
      case 'location':
        screenPath = 'SelectLocations';
        onChange = (values: LocationMiniDTO[]) => {
          const value = values.map(location => ({
            label: location.name,
            value: location.id
          }));
          handleChange(formik, field.name, field.multiple ? value : value[0]);
        };
        break;
      case 'parentLocation':
        screenPath = 'SelectLocations';
        onChange = (values: LocationMiniDTO[]) => {
          const value = values.map(location => ({
            label: location.name,
            value: location.id
          }));
          handleChange(formik, field.name, field.multiple ? value : value[0]);
        };
        break;
      case 'asset':
        screenPath = 'SelectAssets';
        onChange = (values: AssetMiniDTO[]) => {
          const value = values.map(asset => ({
            label: asset.name,
            value: asset.id
          }));
          handleChange(formik, field.name, field.multiple ? value : value[0]);
        };
        break;
      case 'category':
        screenPath = 'SelectCategories';
        onChange = (values: Category[]) => {
          const value = values.map(category => ({
            label: category.name,
            value: category.id
          }));
          handleChange(formik, field.name, field.multiple ? value : value[0]);
        };
        additionalNavigationOptions = { type: field.category };
        break;
      case 'task':
        screenPath = 'SelectTasks';
        onChange = (values: Task[]) => {
          const value = values.map(task => ({
            label: task.taskBase.label,
            value: task
          }));
          handleChange(formik, field.name, value);
        };
        break;
      default:
        return;
    }

    const navigationOptions: { selected: number[], onChange: (value: PartMiniDTO[]) => void; multiple: boolean; } = {
      onChange,
      selected: Array.isArray(values) ? values.map(value => value.value) : [],
      multiple: field.multiple,
      ...additionalNavigationOptions
    };
    const renderValue = (value: { value: number; label: string }) => {
      return (<View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}><Text
        style={{ color: formik.errors[field.name] ? theme.colors.error : theme.colors.primary }}>{value.label}</Text>
        <IconButton onPress={() => {
          handleChange(formik, field.name, Array.isArray(values) ? values.filter(item => value.value !== item.value) : undefined);
        }} icon={'close-circle'} iconColor={theme.colors.error} />
      </View>);
    };
    if (screenPath && field.type2 !== 'task') {
      // @ts-ignore
      return (<TouchableOpacity onPress={() => props.navigation.navigate(screenPath, navigationOptions)}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column'
                                }}>
        <View style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text>{field.label}</Text>
          {!values && <IconButton icon={'plus-circle'} />}
        </View>
        {field.multiple ? (Array.isArray(values) && !!values?.length && values.map(value =>
          renderValue(value))) : values && renderValue(values as { label: string; value: number })}
        {!!formik.errors[field.name] && (<HelperText type={'error'}>{formik.errors[field.name]}</HelperText>)}
      </TouchableOpacity>);
    } else if (field.type2 === 'task') {
      // @ts-ignore
      return (<TouchableOpacity onPress={() => props.navigation.navigate(screenPath, navigationOptions)}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column'
                                }}>
        <View style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text>{field.label}</Text>
          {!values && <IconButton icon={'plus-circle'} />}
        </View>
        {values && Array.isArray(values) && values.map(({ label, value }) => (
          <View
            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {/*@ts-ignore*/}
            <View><Text
              style={{ color: theme.colors.secondary }}>{getTaskTypes(t).find(type => type.value === value.taskBase.taskType)?.label}</Text>
              <Text>{label}</Text>
            </View>
            <IconButton onPress={() => {
              handleChange(formik, field.name, values.filter(item => value.id !== item.value.id));
            }} icon={'close-circle'} iconColor={theme.colors.error} />
          </View>))}
        {!!formik.errors[field.name] && (<HelperText type={'error'}>{formik.errors[field.name]}</HelperText>)}
      </TouchableOpacity>);
    }
  };
  return (
    <ScrollView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Formik<IHash<any>>
        validationSchema={props.validation || validationSchema}
        validateOnChange={true}
        validateOnBlur={true}
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
              <View key={index}
                    style={{
                      marginTop: 5,
                      width: '100%',
                      backgroundColor: 'white',
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                      borderRadius: 5
                    }}>
                {field.type === 'text' ?
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
                    {Boolean(formik.errors[field.name]) && <HelperText type='error'
                    >{t(formik.errors[field.name]?.toString())}</HelperText>}
                  </View> : field.type === 'number' ?
                    <View style={{ width: '100%', alignItems: 'stretch' }}>
                      <TextInput style={{ width: '100%' }} mode='outlined'
                                 error={!!formik.errors[field.name] || field.error}
                                 label={field.label}
                                 defaultValue={formik.values[field.name]}
                                 placeholder={field.placeholder ?? field.label}
                                 onBlur={formik.handleBlur(field.name)}
                                 onChangeText={(newValue) => {
                                   const formattedValue = Number(newValue.replace(/[^0-9]/g, ''));
                                   setNumberInputValue(formattedValue);
                                   handleChange(formik, field.name, formattedValue);
                                 }}
                                 value={numberInputValue.toString()}
                                 disabled={formik.isSubmitting}
                                 multiline={field.multiple}
                      />
                      {Boolean(formik.errors[field.name]) && <HelperText type='error'
                      >{t(formik.errors[field.name]?.toString())}</HelperText>}
                    </View> : field.type === 'file' ? <FileUpload
                      multiple={field.multiple}
                      title={field.label}
                      type={field.fileType || 'file'}
                      description={t('upload')}
                      onChange={(files) => {
                        formik.setFieldValue(field.name, files);
                      }}
                    /> : field.type === 'date' ?
                      <CustomDateTimePicker label={field.label}
                                            onChange={date => handleChange(formik, field.name, date)}
                                            value={formik.values[field.name]} />
                      : field.type === 'switch' ?
                        <View style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Text>{field.label}</Text>
                          <Switch value={formik.values[field.name]}
                                  onValueChange={(value) => {
                                    handleChange(formik, field.name, value);
                                  }} />
                        </View> : renderSelect(formik, field)}
              </View>
            )}
            < Button
              style={{ marginVertical: 20, zIndex: 10 }}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10
  }
});
