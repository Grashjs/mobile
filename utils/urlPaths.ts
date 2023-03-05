import { RootStackParamList } from '../types';

export const getAssetUrl = (id): { route: keyof RootStackParamList, params: {} } => {
  return { route: 'AssetDetails', params: { id } };
};
export const getLocationUrl = (id): { route: keyof RootStackParamList, params: {} } => {
  return { route: 'LocationDetails', params: { id } };
};
export const getTeamUrl = (id): { route: keyof RootStackParamList, params: {} } => {
  return { route: 'TeamDetails', params: { id } };
};
export const getRequestUrl = (id): { route: keyof RootStackParamList, params: {} } => {
  return { route: 'RequestDetails', params: { id } };
};
export const getWorkOrderUrl = (id): { route: keyof RootStackParamList, params: {} } => {
  return { route: 'WODetails', params: { id } };
};
export const getPartUrl = (id): { route: keyof RootStackParamList, params: {} } => {
  return { route: 'PartDetails', params: { id } };
};
export const getMeterUrl = (id): { route: keyof RootStackParamList, params: {} } => {
  return { route: 'MeterDetails', params: { id } };
};
