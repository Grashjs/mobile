import { createContext, FC, ReactNode, useEffect, useReducer } from 'react';
import { OwnUser, UserResponseDTO } from '../models/user';
import api, { authHeader } from '../utils/api';
import { JWT_SECRET, verify } from '../utils/jwt';
import { Alert, AsyncStorage, Linking, Platform } from 'react-native';
import PropTypes from 'prop-types';
import {
  getCompanySettings,
  getUserInfos,
  getUserSettings
} from '../utils/userApi';
import UserSettings from '../models/userSettings';
import CompanySettings from '../models/companySettings';
import { GeneralPreferences } from '../models/generalPreferences';
import internationalization from '../i18n/i18n';
import { FieldConfiguration, FieldType } from '../models/fieldConfiguration';
import { Company } from '../models/company';
import { PermissionEntity } from '../models/role';
import { Audit } from '../models/audit';
import OwnSubscription from '../models/ownSubscription';
import { PlanFeature } from '../models/subscriptionPlan';
import { IField } from '../models/form';
import WorkOrder from '../models/workOrder';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { useTranslation } from 'react-i18next';

interface AuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: UserResponseDTO | null;
  company: Company | null;
  userSettings: UserSettings | null;
  companySettings: CompanySettings | null;
}

export type FieldConfigurationsType = 'workOrder' | 'request';

interface AuthContextValue extends AuthState {
  method: 'JWT';
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (values: any) => Promise<void>;
  getInfos: () => void;
  patchUserSettings: (values: Partial<UserSettings>) => Promise<void>;
  patchUser: (values: Partial<OwnUser>) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  resumeSubscription: () => Promise<void>;
  patchSubscription: (values: Partial<OwnSubscription>) => Promise<void>;
  patchCompany: (values: Partial<Company>) => Promise<void>;
  updatePassword: (values: {
    oldPassword: string;
    newPassword: string;
  }) => Promise<boolean>;
  downgrade: (users: number[]) => Promise<boolean>;
  upgrade: (users: number[]) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  fetchUserSettings: () => Promise<void>;
  fetchCompanySettings: () => Promise<void>;
  fetchCompany: () => Promise<void>;
  patchGeneralPreferences: (
    values: Partial<GeneralPreferences>
  ) => Promise<void>;
  patchFieldConfiguration: (
    fieldName: string,
    fieldType: FieldType,
    fieldConfigurationsType: FieldConfigurationsType
  ) => Promise<void>;
  hasViewPermission: (permission: PermissionEntity) => boolean;
  hasViewOtherPermission: (permission: PermissionEntity) => boolean;
  hasFeature: (feature: PlanFeature) => boolean;
  hasCreatePermission: (permission: PermissionEntity) => boolean;
  hasEditPermission: <Entity extends Audit>(
    permission: PermissionEntity,
    entity: Entity
  ) => boolean;
  hasDeletePermission: <Entity extends Audit>(
    permission: PermissionEntity,
    entity: Entity
  ) => boolean;
  getFilteredFields: (fields: Array<IField>) => Array<IField>;
}

interface AuthProviderProps {
  children: ReactNode;
}

type InitializeAction = {
  type: 'INITIALIZE';
  payload: {
    isAuthenticated: boolean;
    user: UserResponseDTO | null;
    companySettings: CompanySettings | null;
    company: Company | null;
  };
};

type LoginAction = {
  type: 'LOGIN';
  payload: {
    user: UserResponseDTO;
    companySettings: CompanySettings;
    company: Company;
  };
};

type LogoutAction = {
  type: 'LOGOUT';
};

type RegisterAction = {
  type: 'REGISTER';
  payload: {
    user: UserResponseDTO;
    companySettings: CompanySettings;
    company: Company;
  };
};
type PatchUserSettingsAction = {
  type: 'PATCH_USER_SETTINGS';
  payload: {
    userSettings: UserSettings;
  };
};
type PatchUserAction = {
  type: 'PATCH_USER';
  payload: {
    user: UserResponseDTO;
  };
};
type PatchSubscriptionAction = {
  type: 'PATCH_SUBSCRIPTION';
  payload: {
    subscription: OwnSubscription;
  };
};
type CancelSubscriptionAction = {
  type: 'CANCEL_SUBSCRIPTION';
  payload: {};
};
type ResumeSubscriptionAction = {
  type: 'RESUME_SUBSCRIPTION';
  payload: {};
};
type UpgradeAction = {
  type: 'UPGRADE';
  payload: {};
};
type DowngradeAction = {
  type: 'DOWNGRADE';
  payload: {};
};
type PatchCompanyAction = {
  type: 'PATCH_COMPANY';
  payload: {
    company: Company;
  };
};
type FetchUserSettingsAction = {
  type: 'GET_USER_SETTINGS';
  payload: {
    userSettings: UserSettings;
  };
};
type FetchCompanySettingsAction = {
  type: 'GET_COMPANY_SETTINGS';
  payload: {
    companySettings: CompanySettings;
  };
};
type FetchCompanyAction = {
  type: 'GET_COMPANY';
  payload: {
    company: Company;
  };
};
type PatchGeneralPreferencesAction = {
  type: 'PATCH_GENERAL_PREFERENCES';
  payload: {
    generalPreferences: GeneralPreferences;
  };
};
type PatchFieldConfigurationAction = {
  type: 'PATCH_FIELD_CONFIGURATION';
  payload: {
    type: FieldConfigurationsType;
    fieldConfiguration: FieldConfiguration;
  };
};
type Action =
  | InitializeAction
  | LoginAction
  | LogoutAction
  | RegisterAction
  | PatchUserSettingsAction
  | PatchUserAction
  | FetchUserSettingsAction
  | FetchCompanySettingsAction
  | PatchGeneralPreferencesAction
  | PatchFieldConfigurationAction
  | FetchCompanyAction
  | PatchCompanyAction
  | PatchSubscriptionAction
  | CancelSubscriptionAction
  | ResumeSubscriptionAction
  | UpgradeAction
  | DowngradeAction;

const initialAuthState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  company: null,
  userSettings: null,
  companySettings: null
};

const setSession = (accessToken: string | null): void => {
  if (accessToken) {
    AsyncStorage.setItem('accessToken', accessToken);
  } else {
    AsyncStorage.removeItem('accessToken');
    AsyncStorage.removeItem('companyId');
  }
};

const setCompanyId = (companyId: number) => {
  AsyncStorage.setItem('companyId', companyId.toString());
};

const handlers: Record<
  string,
  (state: AuthState, action: Action) => AuthState
> = {
  INITIALIZE: (state: AuthState, action: InitializeAction): AuthState => {
    const { isAuthenticated, user, companySettings, company } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
      companySettings,
      company
    };
  },
  LOGIN: (state: AuthState, action: LoginAction): AuthState => {
    const { user, companySettings, company } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
      companySettings,
      company
    };
  },
  LOGOUT: (state: AuthState): AuthState => ({
    ...state,
    isAuthenticated: false,
    user: null
  }),
  REGISTER: (state: AuthState, action: RegisterAction): AuthState => {
    const { user, companySettings, company } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
      companySettings,
      company
    };
  },
  PATCH_USER_SETTINGS: (
    state: AuthState,
    action: PatchUserSettingsAction
  ): AuthState => {
    const { userSettings } = action.payload;
    return {
      ...state,
      userSettings
    };
  },
  PATCH_USER: (state: AuthState, action: PatchUserAction): AuthState => {
    const { user } = action.payload;
    return {
      ...state,
      user
    };
  },
  PATCH_SUBSCRIPTION: (
    state: AuthState,
    action: PatchSubscriptionAction
  ): AuthState => {
    const { subscription } = action.payload;
    return {
      ...state,
      company: { ...state.company, subscription }
    };
  },
  CANCEL_SUBSCRIPTION: (
    state: AuthState,
    action: CancelSubscriptionAction
  ): AuthState => {
    return {
      ...state,
      company: {
        ...state.company,
        subscription: { ...state.company.subscription, cancelled: true }
      }
    };
  },
  RESUME_SUBSCRIPTION: (
    state: AuthState,
    action: CancelSubscriptionAction
  ): AuthState => {
    return {
      ...state,
      company: {
        ...state.company,
        subscription: { ...state.company.subscription, cancelled: false }
      }
    };
  },
  PATCH_COMPANY: (state: AuthState, action: PatchCompanyAction): AuthState => {
    const { company } = action.payload;
    return {
      ...state,
      company
    };
  },
  GET_USER_SETTINGS: (
    state: AuthState,
    action: FetchUserSettingsAction
  ): AuthState => {
    const { userSettings } = action.payload;
    return {
      ...state,
      userSettings
    };
  },
  GET_COMPANY_SETTINGS: (
    state: AuthState,
    action: FetchCompanySettingsAction
  ): AuthState => {
    const { companySettings } = action.payload;
    return {
      ...state,
      companySettings
    };
  },
  GET_COMPANY: (state: AuthState, action: FetchCompanyAction): AuthState => {
    const { company } = action.payload;
    return {
      ...state,
      company
    };
  },
  PATCH_GENERAL_PREFERENCES: (
    state: AuthState,
    action: PatchGeneralPreferencesAction
  ): AuthState => {
    const { generalPreferences } = action.payload;
    return {
      ...state,
      companySettings: {
        ...state.companySettings,
        generalPreferences
      }
    };
  },
  UPGRADE: (state: AuthState, action: FetchCompanyAction): AuthState => {
    return {
      ...state,
      company: {
        ...state.company,
        subscription: { ...state.company.subscription, upgradeNeeded: false }
      }
    };
  },
  DOWNGRADE: (state: AuthState, action: FetchCompanyAction): AuthState => {
    return {
      ...state,
      company: {
        ...state.company,
        subscription: { ...state.company.subscription, downgradeNeeded: false }
      }
    };
  },
  PATCH_FIELD_CONFIGURATION: (
    state: AuthState,
    action: PatchFieldConfigurationAction
  ): AuthState => {
    const { type, fieldConfiguration } = action.payload;
    const stateClone = { ...state };
    if (type === 'workOrder') {
      stateClone.companySettings.workOrderConfiguration.workOrderFieldConfigurations =
        stateClone.companySettings.workOrderConfiguration.workOrderFieldConfigurations.map(
          (fC) => {
            if (fieldConfiguration.id === fC.id) {
              return fieldConfiguration;
            }
            return fC;
          }
        );
    } else {
      stateClone.companySettings.workOrderRequestConfiguration.fieldConfigurations =
        stateClone.companySettings.workOrderRequestConfiguration.fieldConfigurations.map(
          (fC) => {
            if (fieldConfiguration.id === fC.id) {
              return fieldConfiguration;
            }
            return fC;
          }
        );
    }
    return stateClone;
  }
};

const reducer = (state: AuthState, action: Action): AuthState =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

const AuthContext = createContext<AuthContextValue>({
  ...initialAuthState,
  method: 'JWT',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  getInfos: () => Promise.resolve(),
  patchUserSettings: () => Promise.resolve(),
  patchCompany: () => Promise.resolve(),
  patchUser: () => Promise.resolve(),
  patchSubscription: () => Promise.resolve(),
  cancelSubscription: () => Promise.resolve(),
  resumeSubscription: () => Promise.resolve(),
  fetchUserSettings: () => Promise.resolve(),
  fetchCompany: () => Promise.resolve(),
  updatePassword: () => Promise.resolve(false),
  resetPassword: () => Promise.resolve(false),
  fetchCompanySettings: () => Promise.resolve(),
  patchGeneralPreferences: () => Promise.resolve(),
  patchFieldConfiguration: () => Promise.resolve(),
  hasViewPermission: () => false,
  hasViewOtherPermission: () => false,
  getFilteredFields: () => [],
  hasFeature: () => false,
  hasCreatePermission: () => false,
  hasEditPermission: () => false,
  hasDeletePermission: () => false,
  downgrade: () => Promise.resolve(false),
  upgrade: () => Promise.resolve(false)
});

export const AuthProvider: FC<AuthProviderProps> = (props) => {
  const { children } = props;
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, initialAuthState);
  const switchLanguage = ({ lng }: { lng: any }) => {
    internationalization.changeLanguage(lng);
  };
  const updateUserInfos = async () => {
    const user = await getUserInfos();
    setCompanyId(user.companyId);
    return user;
  };

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      Alert.alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#5569ff'
      });
    }

    return token;
  }

  const checkPushNotificationState = async () => {
    let { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );

    if (existingStatus !== 'granted') {
      const status = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      existingStatus = status.status;
    }
    if (existingStatus !== 'granted') {
      Alert.alert(
        'No Notification Permission',
        'Please goto setting and activate notification permission manually',
        [
          { text: t('cancel'), onPress: () => console.log('cancel') },
          { text: t('allow'), onPress: () => Linking.openURL('app-settings:') }
        ],
        { cancelable: false }
      );
      return;
    }
  };
  const savePushToken = (token: string) =>
    api.post<{ success: boolean }>(`notifications/push-token`, { token });

  const setupUser = async (companySettings: CompanySettings) => {
    switchLanguage({
      lng: companySettings.generalPreferences.language.toLowerCase()
    });
    checkPushNotificationState().then(() =>
      registerForPushNotificationsAsync().then((token) => savePushToken(token))
    );
  };
  const getInfos = async (): Promise<void> => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (accessToken && verify(accessToken, JWT_SECRET)) {
        setSession(accessToken);
        const user = await updateUserInfos();
        const company = await api.get<Company>(`companies/${user.companyId}`);
        await setupUser(company.companySettings);
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: true,
            user,
            companySettings: company.companySettings,
            company
          }
        });
      } else {
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
            companySettings: null,
            company: null
          }
        });
      }
    } catch (err) {
      console.error(err);
      dispatch({
        type: 'INITIALIZE',
        payload: {
          isAuthenticated: false,
          user: null,
          companySettings: null,
          company: null
        }
      });
    }
  };
  const login = async (email: string, password: string): Promise<void> => {
    const response = await api.post<{ accessToken: string }>(
      'auth/signin',
      {
        email,
        type: 'client',
        password
      },
      { headers: await authHeader(true) }
    );
    const { accessToken } = response;
    setSession(accessToken);
    const user = await updateUserInfos();
    const company = await api.get<Company>(`companies/${user.companyId}`);
    await setupUser(company.companySettings);
    dispatch({
      type: 'LOGIN',
      payload: {
        user,
        companySettings: company.companySettings,
        company
      }
    });
  };

  const logout = async (): Promise<void> => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (values): Promise<void> => {
    const response = await api.post<{ message: string; success: boolean }>(
      'auth/signup',
      values,
      { headers: await authHeader(true) }
    );
    const { message, success } = response;
    if (message.startsWith('Successful')) {
      return;
    } else {
      setSession(message);
      const user = await updateUserInfos();
      const company = await api.get<Company>(`companies/${user.companyId}`);
      await setupUser(company.companySettings);
      dispatch({
        type: 'REGISTER',
        payload: {
          user,
          companySettings: company.companySettings,
          company
        }
      });
    }
  };

  const patchUserSettings = async (
    values: Partial<UserSettings>
  ): Promise<void> => {
    const userSettings = await api.patch<UserSettings>(
      `user-settings/${state.userSettings.id}`,
      values
    );
    dispatch({
      type: 'PATCH_USER_SETTINGS',
      payload: {
        userSettings
      }
    });
  };
  const patchCompany = async (values: Partial<Company>): Promise<void> => {
    const company = await api.patch<Company>(`companies/${state.company.id}`, {
      ...state.company,
      ...values
    });
    dispatch({
      type: 'PATCH_COMPANY',
      payload: {
        company
      }
    });
  };
  const patchUser = async (values: Partial<OwnUser>): Promise<void> => {
    const user = await api.patch<UserResponseDTO>(`users/${state.user.id}`, {
      ...state.user,
      ...values
    });
    dispatch({
      type: 'PATCH_USER',
      payload: {
        user
      }
    });
  };
  const patchSubscription = async (values: OwnSubscription): Promise<void> => {
    dispatch({
      type: 'PATCH_SUBSCRIPTION',
      payload: {
        subscription: values
      }
    });
  };
  const cancelSubscription = async (): Promise<void> => {
    const response = await api.get<{ success: boolean }>(`fast-spring/cancel`);
    const { success } = response;
    if (success) {
      dispatch({
        type: 'CANCEL_SUBSCRIPTION',
        payload: {}
      });
    }
  };
  const resumeSubscription = async (): Promise<void> => {
    const response = await api.get<{ success: boolean }>(`fast-spring/resume`);
    const { success } = response;
    if (success) {
      dispatch({
        type: 'RESUME_SUBSCRIPTION',
        payload: {}
      });
    }
  };
  const updatePassword = async (values: {
    oldPassword: string;
    newPassword: string;
  }): Promise<boolean> => {
    const response = await api.post<{ success: boolean }>(
      `auth/updatepwd`,
      values
    );
    const { success } = response;
    return success;
  };
  const resetPassword = async (email: string): Promise<boolean> => {
    const response = await api.get<{ success: boolean }>(
      `auth/resetpwd?email=${email}`,
      { headers: await authHeader(true) }
    );
    const { success } = response;
    return success;
  };
  const fetchUserSettings = async (): Promise<void> => {
    const userSettings = await getUserSettings(state.user.userSettingsId);
    dispatch({
      type: 'GET_USER_SETTINGS',
      payload: {
        userSettings
      }
    });
  };

  const fetchCompanySettings = async (): Promise<void> => {
    const companySettings = await getCompanySettings(
      state.user.companySettingsId
    );
    dispatch({
      type: 'GET_COMPANY_SETTINGS',
      payload: {
        companySettings
      }
    });
  };
  const fetchCompany = async (): Promise<void> => {
    const company = await api.get<Company>(state.user.companyId);
    dispatch({
      type: 'GET_COMPANY',
      payload: {
        company
      }
    });
  };
  const patchGeneralPreferences = async (
    values: Partial<GeneralPreferences>
  ): Promise<void> => {
    const generalPreferences = await api.patch<GeneralPreferences>(
      `general-preferences/${state.companySettings.generalPreferences.id}`,
      { ...state.companySettings.generalPreferences, ...values }
    );
    dispatch({
      type: 'PATCH_GENERAL_PREFERENCES',
      payload: {
        generalPreferences
      }
    });
  };

  const patchFieldConfiguration = async (
    fieldName: string,
    fieldType: FieldType,
    fieldConfigurationsType: FieldConfigurationsType
  ): Promise<void> => {
    let id;
    if (fieldConfigurationsType === 'workOrder') {
      id =
        state.companySettings.workOrderConfiguration.workOrderFieldConfigurations.find(
          (workOrderFieldConfiguration) =>
            workOrderFieldConfiguration.fieldName === fieldName
        ).id;
    } else {
      id =
        state.companySettings.workOrderRequestConfiguration.fieldConfigurations.find(
          (fieldConfiguration) => fieldConfiguration.fieldName === fieldName
        ).id;
    }
    const fieldConfiguration = await api.patch<FieldConfiguration>(
      `field-configurations/${id}`,
      { fieldType }
    );
    dispatch({
      type: 'PATCH_FIELD_CONFIGURATION',
      payload: {
        type: fieldConfigurationsType,
        fieldConfiguration
      }
    });
  };
  const hasViewPermission = (permissionEntity: PermissionEntity) => {
    return state.user.role.viewPermissions.includes(permissionEntity);
  };
  const hasViewOtherPermission = (permissionEntity: PermissionEntity) => {
    return state.user.role.viewOtherPermissions.includes(permissionEntity);
  };
  const hasCreatePermission = (permissionEntity: PermissionEntity) => {
    return state.user.role.createPermissions.includes(permissionEntity);
  };
  const hasEditPermission = <Entity extends Audit>(
    permissionEntity: PermissionEntity,
    entity: Entity
  ) => {
    if (!entity) return false;
    if (permissionEntity === PermissionEntity.PEOPLE_AND_TEAMS) {
      return (
        state.user.id === entity.id ||
        state.user.role.editOtherPermissions.includes(permissionEntity)
      );
    }
    if (permissionEntity === PermissionEntity.WORK_ORDERS) {
      const isAssignedTo = (workOrder: WorkOrder, user: OwnUser): boolean => {
        let users = [];
        if (workOrder.primaryUser) {
          users.push(workOrder.primaryUser);
        }
        if (workOrder.team) {
          users = users.concat(workOrder.team.users);
        }
        if (workOrder.assignedTo) {
          users.concat(workOrder.assignedTo);
        }
        return users.some((user1) => user1.id === user.id);
      };
      return (
        state.user.id === entity.createdBy ||
        state.user.role.editOtherPermissions.includes(permissionEntity) ||
        isAssignedTo(entity as unknown as WorkOrder, state.user)
      );
    }
    return (
      state.user.id === entity.createdBy ||
      state.user.role.editOtherPermissions.includes(permissionEntity)
    );
  };
  const hasDeletePermission = <Entity extends Audit>(
    permissionEntity: PermissionEntity,
    entity: Entity
  ) => {
    if (!entity) return false;
    return (
      state.user.id === entity.createdBy ||
      state.user.role.deleteOtherPermissions.includes(permissionEntity)
    );
  };
  const hasFeature = (feature: PlanFeature) => {
    return state.company.subscription.subscriptionPlan.features.includes(
      feature
    );
  };
  const getFilteredFields = (defaultFields: Array<IField>): IField[] => {
    let fields = [...defaultFields];
    if (!hasFeature(PlanFeature.FILE)) {
      fields = fields.filter((field) => field.type !== 'file');
    }
    return fields;
  };
  const upgrade = async (users: number[]) => {
    try {
      const { success } = await api.post<{ success: boolean }>(
        'subscriptions/upgrade',
        users,
        {},
        true
      );
      if (success)
        dispatch({
          type: 'UPGRADE',
          payload: {}
        });
      return success;
    } catch (err) {
      return false;
    }
  };
  const downgrade = async (users: number[]) => {
    try {
      const { success } = await api.post<{ success: boolean }>(
        'subscriptions/downgrade',
        users,
        {},
        true
      );
      if (success)
        dispatch({
          type: 'DOWNGRADE',
          payload: {}
        });
      return success;
    } catch (err) {
      return false;
    }
  };
  useEffect(() => {
    getInfos();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'JWT',
        login,
        logout,
        register,
        getInfos,
        patchUser,
        patchSubscription,
        cancelSubscription,
        resumeSubscription,
        patchCompany,
        updatePassword,
        resetPassword,
        patchUserSettings,
        fetchUserSettings,
        fetchCompanySettings,
        fetchCompany,
        patchGeneralPreferences,
        patchFieldConfiguration,
        hasViewPermission,
        hasViewOtherPermission,
        hasFeature,
        getFilteredFields,
        hasEditPermission,
        hasDeletePermission,
        hasCreatePermission,
        upgrade,
        downgrade
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;
