/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  CompositeScreenProps,
  NavigatorScreenParams
} from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import WorkOrder from './models/workOrder';
import Part, { PartMiniDTO } from './models/part';
import { Task } from './models/tasks';
import { Customer, CustomerMiniDTO } from './models/customer';
import { Vendor, VendorMiniDTO } from './models/vendor';
import User, { UserMiniDTO } from './models/user';
import Team, { TeamMiniDTO } from './models/team';
import Location, { LocationMiniDTO } from './models/location';
import Asset, { AssetDTO, AssetMiniDTO } from './models/asset';
import Category from './models/category';
import { FilterField } from './models/page';
import Request from './models/request';
import Meter from './models/meter';
import Notification from './models/notification';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  AddWorkOrder: { location?: Location; asset?: AssetDTO };
  WorkOrderStats: undefined;
  EditWorkOrder: { workOrder: WorkOrder; tasks: Task[] };
  EditRequest: { request: Request };
  EditAsset: { asset: AssetDTO };
  EditLocation: { location: Location };
  EditPart: { part: Part };
  EditMeter: { meter: Meter };
  EditUser: { user: User };
  EditCustomer: { customer: Customer };
  EditVendor: { vendor: Vendor };
  EditTeam: { team: Team };
  AddRequest: undefined;
  AddAsset: { location?: Location; parentAsset?: AssetDTO };
  AddLocation: undefined;
  AddPart: undefined;
  AddMeter: undefined;
  AddUser: undefined;
  WODetails: { id: number };
  AssetDetails: { id: number };
  LocationDetails: { id: number };
  RequestDetails: { id: number };
  UserDetails: { id: number };
  UserProfile: undefined;
  TeamDetails: { id: number };
  PartDetails: { id: number };
  MeterDetails: { id: number };
  CustomerDetails: { id: number };
  VendorDetails: { id: number };
  Modal: undefined;
  Tasks: {
    tasksProps: Task[];
    workOrderId: number;
  };
  SelectParts: { onChange: (parts: PartMiniDTO[]) => void; selected: number[] };
  SelectCustomers: {
    onChange: (customers: CustomerMiniDTO[]) => void;
    selected: number[];
    multiple: boolean;
  };
  SelectVendors: {
    onChange: (vendors: VendorMiniDTO[]) => void;
    selected: number[];
    multiple: boolean;
  };
  SelectUsers: {
    onChange: (users: UserMiniDTO[]) => void;
    selected: number[];
    multiple: boolean;
  };
  SelectTeams: {
    onChange: (teams: TeamMiniDTO[]) => void;
    selected: number[];
    multiple: boolean;
  };
  SelectLocations: {
    onChange: (locations: LocationMiniDTO[]) => void;
    selected: number[];
    multiple: boolean;
  };
  SelectAssets: {
    onChange: (assets: AssetMiniDTO[]) => void;
    selected: number[];
    multiple: boolean;
  };
  SelectTasks: { onChange: (tasks: Task[]) => void; selected: Task[] };
  SelectCategories: {
    onChange: (categories: Category[]) => void;
    selected: number[];
    multiple: boolean;
    type: string;
  };
  CompleteWorkOrder: {
    onComplete: (
      signatureId: number | undefined,
      feedback: string | undefined
    ) => Promise<any>;
    fieldsConfig: { feedback: boolean; signature: boolean };
  };
  NotFound: undefined;
  Meters: undefined;
  Parts: undefined;
  Locations: { id?: number; hierarchy?: number[] };
  Assets: { id?: number; hierarchy?: number[] };
  PeopleTeams: undefined;
  VendorsCustomers: undefined;
  Notifications: undefined;
  Settings: undefined;
  PDFViewer: { uri: string; title: string };
  WorkOrderFilters: {
    filterFields: FilterField[];
    onFilterChange: (filterFields: FilterField[]) => void;
  };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  Home: undefined;
  WorkOrders: { filterFields: FilterField[] };
  AddEntities: undefined;
  Requests: undefined;
  MoreEntities: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;
export type AuthStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  Verify: undefined;
};
export type AuthStackScreenProps<Screen extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, Screen>;
