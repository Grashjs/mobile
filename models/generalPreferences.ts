import Currency from './currency';

export interface GeneralPreferences {
  id: number;
  language: string;
  dateFormat: 'MMDDYY' | 'DDMMYY';
  currency: Currency;
  businessType: string;
  timeZone: string;

  autoAssignWorkOrders: boolean;

  autoAssignRequests: boolean;

  disableClosedWorkOrdersNotif: boolean;

  askFeedBackOnWOClosed: boolean;

  laborCostInTotalCost: boolean;

  woUpdateForRequesters: boolean;

  simplifiedWorkOrder: boolean;
}
