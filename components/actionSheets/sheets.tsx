import { registerSheet } from 'react-native-actions-sheet';
import CreateEntitiesSheet from './CreateEntitiesSheet';
import WorkOrderDetailsSheet from './WorkOrderDetailsSheet';
import AssetDetailsSheet from './AssetDetailsSheet';
import PartDetailsSheet from './PartDetailsSheet';
import LocationDetailsSheet from './LocationDetailsSheet';
import CustomerDetailsSheet from './CustomerDetailsSheet';
import VendorDetailsSheet from './VendorDetailsSheet';
import MeterDetailsSheet from './MeterDetailsSheet';

registerSheet('create-entities-sheet', CreateEntitiesSheet);
registerSheet('work-order-details-sheet', WorkOrderDetailsSheet);
registerSheet('asset-details-sheet', AssetDetailsSheet);
registerSheet('location-details-sheet', LocationDetailsSheet);
registerSheet('part-details-sheet', PartDetailsSheet);
registerSheet('customer-details-sheet', CustomerDetailsSheet);
registerSheet('vendor-details-sheet', VendorDetailsSheet);
registerSheet('meter-details-sheet', MeterDetailsSheet);
export {};
