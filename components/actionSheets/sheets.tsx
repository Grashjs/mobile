import { registerSheet } from 'react-native-actions-sheet';
import CreateEntitiesSheet from './CreateEntitiesSheet';
import WorkOrderDetailsSheet from './WorkOrderDetailsSheet';
import AssetDetailsSheet from './AssetDetailsSheet';

registerSheet('create-entities-sheet', CreateEntitiesSheet);
registerSheet('work-order-details-sheet', WorkOrderDetailsSheet);
registerSheet('asset-details-sheet', AssetDetailsSheet);
export {};
