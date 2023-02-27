/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import WorkOrder from './models/workOrder';
import { PartMiniDTO } from './models/part';
import { Task } from './models/tasks';
import { Customer, CustomerMiniDTO } from './models/customer';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {
    }
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  AddWorkOrder: undefined;
  AddRequest: undefined;
  AddAsset: undefined;
  AddLocation: undefined;
  AddPart: undefined;
  AddMeter: undefined;
  AddUser: undefined;
  WODetails: { id: number };
  Modal: undefined;
  Tasks: {
    tasksProps: Task[];
    workOrderId: number;
  };
  SelectParts: { onChange: (parts: PartMiniDTO[]) => void; selected: number[] },
  SelectCustomers: { onChange: (customers: CustomerMiniDTO[]) => void; selected: number[]; multiple: boolean },
  CompleteWorkOrder: {
    onComplete: (signatureId: number | undefined,
                 feedback: string | undefined) => Promise<any>; fieldsConfig: { feedback: boolean; signature: boolean };
  }
  NotFound: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList,
  Screen>;

export type RootTabParamList = {
  Home: undefined;
  WorkOrders: undefined;
  AddEntities: undefined;
  Requests: undefined;
  MoreEntities: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<BottomTabScreenProps<RootTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>>;
export type AuthStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  Verify: undefined
};
export type AuthStackScreenProps<Screen extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList,
  Screen>;
