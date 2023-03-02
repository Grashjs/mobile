import { Audit } from './audit';
import Request from './request';
import Team from './team';
import Asset from './asset';
import File from './file';
import Location from './location';
import Category from './category';
import { OwnUser, UserMiniDTO } from './user';
import { CustomerMiniDTO } from './customer';
import PreventiveMaintenance from './preventiveMaintenance';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type WorkOrderStatus = 'OPEN' | 'ON_HOLD' | 'IN_PROGRESS' | 'COMPLETE'

interface WorkOrderBase extends Audit {
  dueDate: string;
  status: WorkOrderStatus;
  priority: Priority;
  estimatedDuration: number;
  description: string;
  title: string;
  requiredSignature: boolean;
  location: Location;
  team: Team;
  primaryUser: OwnUser;
  assignedTo: UserMiniDTO[];
  files: File[];
  image: File | null;
  customers: CustomerMiniDTO[];
  asset: Asset;
}

export default interface WorkOrder extends WorkOrderBase {
  category: Category | null;
  id: number;
  completedBy: OwnUser;
  completedOn: string;
  archived: boolean;
  parentRequest: Request;
  parentPreventiveMaintenance: PreventiveMaintenance;
  signature: File;
  feedback: string;
  //parentPreventiveMaintenance:
}
