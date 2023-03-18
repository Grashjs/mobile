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
import { addLocation, editLocation } from '../../slices/location';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { formatLocationValues, getLocationFields } from '../../utils/fields';
import { getWOBaseValues } from '../../utils/woBase';
import { patchTasks } from '../../slices/task';
import useAuth from '../../hooks/useAuth';

export default function EditLocationScreen({
  navigation,
  route
}: RootStackScreenProps<'EditLocation'>) {
  const { t } = useTranslation();
  const { location } = route.params;
  const { getFilteredFields } = useAuth();
  const { uploadFiles, getWOFieldsAndShapes } = useContext(
    CompanySettingsContext
  );
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const dispatch = useDispatch();
  const shape = {
    name: Yup.string().required(t('required_location_name')),
    address: Yup.string().required(t('required_location_address'))
  };
  const getEditFields = () => {
    const fieldsClone = [...getFilteredFields(getLocationFields(t))];
    const parentLocationIndex = fieldsClone.findIndex(
      (field) => field.name === 'parentLocation'
    );
    fieldsClone.splice(parentLocationIndex, 1);
    return fieldsClone;
  };
  const onEditSuccess = () => {
    showSnackBar(t('changes_saved_success'), 'success');
    navigation.goBack();
  };
  const onEditFailure = (err) =>
    showSnackBar(t('location_update_failure'), 'error');

  return (
    <View style={styles.container}>
      <Form
        fields={getEditFields()}
        validation={Yup.object().shape(shape)}
        navigation={navigation}
        submitText={t('save')}
        values={{
          ...location,
          title: location?.name,
          workers: location?.workers.map((worker) => {
            return {
              label: `${worker.firstName} ${worker.lastName}`,
              value: worker.id
            };
          }),
          teams: location?.teams.map((team) => {
            return {
              label: team.name,
              value: team.id
            };
          }),
          vendors: location?.vendors.map((vendor) => {
            return {
              label: vendor.companyName,
              value: vendor.id
            };
          }),
          customers: location?.customers.map((customer) => {
            return {
              label: customer.name,
              value: customer.id
            };
          }),
          coordinates: location?.longitude
            ? {
                lng: location.longitude,
                lat: location.latitude
              }
            : null
        }}
        onChange={({ field, e }) => {}}
        onSubmit={async (values) => {
          let formattedValues = formatLocationValues(values);
          //differentiate files from api and formattedValues
          const files = formattedValues.files.find((file) => file.id)
            ? []
            : formattedValues.files;
          return new Promise<void>((resolve, rej) => {
            uploadFiles(files, formattedValues.image)
              .then((files) => {
                const imageAndFiles = getImageAndFiles(files, location.image);
                formattedValues = {
                  ...formattedValues,
                  image: imageAndFiles.image,
                  files: [...location.files, ...imageAndFiles.files]
                };
                dispatch(editLocation(location.id, formattedValues))
                  .then(() => {
                    resolve();
                    onEditSuccess();
                  })
                  .catch((err) => {
                    onEditFailure(err);
                    rej(err);
                  });
              })
              .catch((err) => {
                onEditFailure(err);
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
