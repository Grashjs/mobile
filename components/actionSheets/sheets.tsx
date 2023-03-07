import { registerSheet } from 'react-native-actions-sheet';
import CreateEntitiesSheet from './CreateEntitiesSheet';
import WorkOrderDetailsSheet from './WorkOrderDetailsSheet';
import AssetDetailsSheet from './AssetDetailsSheet';
import LocationDetailsSheet from './LocationDetailsSheet';

registerSheet('create-entities-sheet', CreateEntitiesSheet);
registerSheet('work-order-details-sheet', WorkOrderDetailsSheet);
registerSheet('asset-details-sheet', AssetDetailsSheet);
registerSheet('location-details-sheet', LocationDetailsSheet);
export {};
