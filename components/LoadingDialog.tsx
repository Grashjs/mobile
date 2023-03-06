import { Dialog, Portal, Provider, Text, useTheme } from 'react-native-paper';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export default function LoadingDialog({ visible }: { visible: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Provider theme={theme}>
      <Portal>
        <Dialog visible={visible}>
          <Dialog.Title>{t('loading')}</Dialog.Title>
          <Dialog.Content>
            <Text variant='bodyMedium'>{t('please_wait')}</Text>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </Provider>
  );
}
