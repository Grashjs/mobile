import { WorkOrderBase } from './workOrderBase';
import Schedule from './schedule';

export default interface PreventiveMaintenance extends WorkOrderBase {
  name: string;
  schedule: Schedule;
}
export interface PreventiveMaintenancePost extends PreventiveMaintenance {
  frequency: number;
  startsOn: string;
  endsOn: string;
}
