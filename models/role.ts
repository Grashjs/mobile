export enum BasicPermission {
  CREATE_EDIT_PEOPLE_AND_TEAMS = 'CREATE_EDIT_PEOPLE_AND_TEAMS',
  CREATE_EDIT_CATEGORIES = 'CREATE_EDIT_CATEGORIES',
  DELETE_WORK_ORDERS = 'DELETE_WORK_ORDERS',
  DELETE_LOCATIONS = 'DELETE_LOCATIONS',
  DELETE_PREVENTIVE_MAINTENANCE_TRIGGERS = 'DELETE_PREVENTIVE_MAINTENANCE_TRIGGERS',
  DELETE_ASSETS = 'DELETE_ASSETS',
  DELETE_PARTS_AND_MULTI_PARTS = 'DELETE_PARTS_AND_MULTI_PARTS',
  DELETE_PURCHASE_ORDERS = 'DELETE_PURCHASE_ORDERS',
  DELETE_METERS = 'DELETE_METERS',
  DELETE_VENDORS_AND_CUSTOMERS = 'DELETE_VENDORS_AND_CUSTOMERS',
  DELETE_CATEGORIES = 'DELETE_CATEGORIES',
  DELETE_FILES = 'DELETE_FILES',
  DELETE_PEOPLE_AND_TEAMS = 'DELETE_PEOPLE_AND_TEAMS',
  ACCESS_SETTINGS = 'ACCESS_SETTINGS'
}

export enum PermissionEntity {
  PEOPLE_AND_TEAMS = 'PEOPLE_AND_TEAMS',
  CATEGORIES = 'CATEGORIES',
  CATEGORIES_WEB = 'CATEGORIES_WEB',
  WORK_ORDERS = 'WORK_ORDERS',
  PREVENTIVE_MAINTENANCES = 'PREVENTIVE_MAINTENANCES',
  ASSETS = 'ASSETS',
  PARTS_AND_MULTIPARTS = 'PARTS_AND_MULTIPARTS',
  PURCHASE_ORDERS = 'PURCHASE_ORDERS',
  METERS = 'METERS',
  VENDORS_AND_CUSTOMERS = 'VENDORS_AND_CUSTOMERS',
  FILES = 'FILES',
  LOCATIONS = 'LOCATIONS',
  SETTINGS = 'SETTINGS',
  REQUESTS = 'REQUESTS',
  ANALYTICS = 'ANALYTICS'
}

export const createEntities: PermissionEntity[] = [
  PermissionEntity.PEOPLE_AND_TEAMS,
  PermissionEntity.WORK_ORDERS,
  PermissionEntity.ASSETS,
  PermissionEntity.PARTS_AND_MULTIPARTS,
  PermissionEntity.METERS,
  PermissionEntity.LOCATIONS,
  PermissionEntity.REQUESTS
];
export const viewMoreEntities: PermissionEntity[] = [
  PermissionEntity.PEOPLE_AND_TEAMS,
  PermissionEntity.ASSETS,
  PermissionEntity.PARTS_AND_MULTIPARTS,
  PermissionEntity.METERS,
  PermissionEntity.LOCATIONS,
  PermissionEntity.VENDORS_AND_CUSTOMERS
];
export type PermissionRoot =
  | 'createPermissions'
  | 'viewPermissions'
  | 'viewOtherPermissions'
  | 'editOtherPermissions'
  | 'deleteOtherPermissions';
export type RoleCode =
  | 'ADMIN'
  | 'LIMITED_ADMIN'
  | 'TECHNICIAN'
  | 'LIMITED_TECHNICIAN'
  | 'VIEW_ONLY'
  | 'REQUESTER'
  | 'USER_CREATED';

export interface Role {
  id: number;
  name: string;
  users: number;
  externalId?: string;
  description?: string;
  paid: boolean;
  code: RoleCode;
  createPermissions: PermissionEntity[];
  viewPermissions: PermissionEntity[];
  viewOtherPermissions: PermissionEntity[];
  editOtherPermissions: PermissionEntity[];
  deleteOtherPermissions: PermissionEntity[];
}
