import { createContext, FC, ReactNode, useState } from 'react';
import { Snackbar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

type CustomSnackBarContext = {
  showSnackBar: (
    message: string,
    type?: 'error' | 'success',
    action?: { label: string; onPress: () => void }
  ) => void;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CustomSnackBarContext = createContext<CustomSnackBarContext>(
  {} as CustomSnackBarContext
);

export const CustomSnackbarProvider: FC<{ children: ReactNode }> = ({
  children
}) => {
  const [message, setMessage] = useState<string>('');
  const theme = useTheme();
  const [snackBarType, setSnackBarType] = useState<
    'error' | 'success' | 'info'
  >('info');
  const [visible, setVisible] = useState(false);
  const [actionInternal, setActionInternal] = useState<{
    label: string;
    onPress: () => void;
  }>();
  const { t } = useTranslation();
  const showSnackBar = (
    text: string,
    type?: 'error' | 'success' | 'info',
    action?: { label: string; onPress: () => void }
  ) => {
    setMessage(text);
    setActionInternal(action);
    setVisible(true);
    setSnackBarType(type);
  };

  const getColor = () => {
    switch (snackBarType) {
      case 'info':
        return 'black';
      case 'error':
        return theme.colors.error;
      case 'success':
        // @ts-ignore
        return theme.colors.success;
    }
  };
  const onDismissSnackBar = () => setVisible(false);
  return (
    <CustomSnackBarContext.Provider value={{ showSnackBar }}>
      <Snackbar
        style={{ zIndex: 100, backgroundColor: getColor() }}
        visible={visible}
        onDismiss={onDismissSnackBar}
        action={actionInternal}
      >
        {message}
      </Snackbar>
      {children}
    </CustomSnackBarContext.Provider>
  );
};
