import { createContext, FC, ReactNode, useState } from 'react';
import { Snackbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

type CustomSnackBarContext = {
  showSnackBar: (message: string, type: 'error' | 'success') => void;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CustomSnackBarContext = createContext<CustomSnackBarContext>(
  {} as CustomSnackBarContext,
);

export const CustomSnackbarProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const showSnackBar = (text: string, type: 'error' | 'success') => {
    setMessage(text);
    setVisible(true);
  };

  const onDismissSnackBar = () => setVisible(false);
  return (
    <CustomSnackBarContext.Provider value={{ showSnackBar }}>
      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        action={{
          label: t('undo'),
          onPress: () => {
            // Do something
          },
        }}>
        {message}
      </Snackbar>
      {children}
    </CustomSnackBarContext.Provider>
  );
};
