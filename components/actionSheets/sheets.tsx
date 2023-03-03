import { registerSheet } from 'react-native-actions-sheet';
import CreateEntitiesSheet from './CreateEntitiesSheet';
import WorkOrderDetailsSheet from './WorkOrderDetailsSheet';

registerSheet('create-entities-sheet', CreateEntitiesSheet);
registerSheet('work-order-details-sheet', WorkOrderDetailsSheet);
export {};
