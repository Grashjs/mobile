import { UserMiniDTO } from './user';
import { Audit } from './audit';
import { CustomerMiniDTO } from './customer';
import { VendorMiniDTO } from './vendor';
import { TeamMiniDTO } from './team';
import { FileMiniDTO } from './file';

export default interface Location extends Audit {
  id: number;
  name: string;
  address: string;
  longitude: number;
  image: FileMiniDTO;
  files: FileMiniDTO[];
  latitude: number;
  parentLocation: LocationMiniDTO | null;
  vendors: VendorMiniDTO[];
  customers: CustomerMiniDTO[];
  workers: UserMiniDTO[];
  teams: TeamMiniDTO[];
}
export interface LocationMiniDTO {
  id: number;
  name: string;
  address: string;
}

export interface LocationRow extends Location {
  hierarchy: number[];
  childrenFetched?: boolean;
}

export const locations: Location[] = [
  {
    name: 'Location 1',
    id: 54,
    address: 'Add1',
    createdAt: 'fghb',
    createdBy: 1,
    updatedAt: 'string',
    updatedBy: 1,
    image: null,
    files: [],
    vendors: [],
    customers: [],
    parentLocation: null,
    workers: [],
    longitude: 40.744509157650334,
    latitude: -74.06030716227161,
    teams: []
  },
  {
    name: 'Location 2',
    id: 53,
    address: 'Add1',
    createdAt: 'fghb',
    createdBy: 1,
    updatedAt: 'string',
    updatedBy: 1,
    image: null,
    vendors: [],
    customers: [],
    parentLocation: null,
    workers: [],
    longitude: 40.744509157650334,
    latitude: -74.06030716227161,
    teams: [],
    files: []
  }
];
