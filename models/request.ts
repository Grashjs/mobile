import WorkOrder from './workOrder';
import { WorkOrderBase } from './workOrderBase';

export default interface Request extends WorkOrderBase {
  cancelled: boolean;
  workOrder: WorkOrder;
}
