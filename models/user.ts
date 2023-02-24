import { Audit } from './audit';
import { Role } from './role';
import File from './file';

export type UserRole = 'admin' | 'customer' | 'subscriber';
export default interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  companyName: string;
  accountType: string;
  lastVisit: string;
  hourlyRate: number;
}

export interface OwnUser extends Audit {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  rate: number;
  phone: string;
  ownsCompany: boolean;
  jobTitle: string;
  role: Role;
  companyId: number;
  image: File;
}
export interface UserMiniDTO {
  firstName: string;
  lastName: string;
  image: File;
  id: number;
}

export interface UserResponseDTO extends OwnUser {
  companySettingsId: number;
  userSettingsId: number;
}

export const users: User[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    phone: '+00212611223344',
    jobTitle: 'Job',
    companyName: 'Company',
    accountType: 'Administrator',
    lastVisit: '02/09/22',
    hourlyRate: 4
  },
  {
    id: 2,
    firstName: 'John',
    lastName: 'Jr',
    email: 'john.doe@gmail.com',
    phone: '+00212611223344',
    jobTitle: 'Job',
    companyName: 'Company',
    accountType: 'Administrator',
    lastVisit: '02/09/22',
    hourlyRate: 8
  }
];
