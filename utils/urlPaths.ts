import { RootStackParamList } from '../types';
import { NotificationType } from '../models/notification';

export const getAssetUrl = (
  id
): { route: keyof RootStackParamList; params: {} } => {
  return { route: 'AssetDetails', params: { id } };
};
export const getLocationUrl = (
  id
): { route: keyof RootStackParamList; params: {} } => {
  return { route: 'LocationDetails', params: { id } };
};
export const getTeamUrl = (
  id
): { route: keyof RootStackParamList; params: {} } => {
  return { route: 'TeamDetails', params: { id } };
};
export const getRequestUrl = (
  id
): { route: keyof RootStackParamList; params: {} } => {
  return { route: 'RequestDetails', params: { id } };
};
export const getWorkOrderUrl = (
  id
): { route: keyof RootStackParamList; params: {} } => {
  return { route: 'WODetails', params: { id } };
};
export const getPartUrl = (
  id
): { route: keyof RootStackParamList; params: {} } => {
  return { route: 'PartDetails', params: { id } };
};
export const getMeterUrl = (
  id
): { route: keyof RootStackParamList; params: {} } => {
  return { route: 'MeterDetails', params: { id } };
};
export const getUserUrl = (
  id
): { route: keyof RootStackParamList; params: {} } => {
  return { route: 'UserDetails', params: { id } };
};
export const getCustomerUrl = (
  id
): { route: keyof RootStackParamList; params: {} } => {
  return { route: 'CustomerDetails', params: { id } };
};
export const getVendorUrl = (
  id
): { route: keyof RootStackParamList; params: {} } => {
  return { route: 'VendorDetails', params: { id } };
};

export const getNotificationUrl = (
  type: NotificationType,
  id: number
): { route: keyof RootStackParamList; params: {} } => {
  let url;
  switch (type) {
    case 'INFO':
      break;
    case 'ASSET':
      url = getAssetUrl(id);
      break;
    case 'REQUEST':
      url = getRequestUrl(id);
      break;
    case 'WORK_ORDER':
      url = getWorkOrderUrl(id);
      break;
    case 'PART':
      url = getPartUrl(id);
      break;
    case 'METER':
      url = getMeterUrl(id);
      break;
    case 'LOCATION':
      url = getLocationUrl(id);
      break;
    case 'TEAM':
      url = getTeamUrl(id);
      break;
    default:
      break;
  }
  return url;
};
