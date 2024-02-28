import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from '../store';
import { Customer, CustomerMiniDTO } from '../models/customer';
import api from '../utils/api';
import { getInitialPage, Page, SearchCriteria } from '../models/page';
import { revertAll } from '../utils/redux';

const basePath = 'customers';

interface CustomerState {
  customers: Page<Customer>;
  customerInfos: { [key: number]: { customer?: Customer } };
  customersMini: CustomerMiniDTO[];
  currentPageNum: number;
  lastPage: boolean;
  loadingGet: boolean;
}

const initialState: CustomerState = {
  customers: getInitialPage<Customer>(),
  customerInfos: {},
  customersMini: [],
  currentPageNum: 0,
  lastPage: true,
  loadingGet: false
};

const slice = createSlice({
  name: 'customers',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    getCustomers(
      state: CustomerState,
      action: PayloadAction<{ customers: Page<Customer> }>
    ) {
      const { customers } = action.payload;
      state.customers = customers;
      state.currentPageNum = 0;
      state.lastPage = customers.last;
    },
    getMoreCustomers(
      state: CustomerState,
      action: PayloadAction<{ customers: Page<Customer> }>
    ) {
      const { customers } = action.payload;
      state.customers.content = state.customers.content.concat(
        customers.content
      );
      state.currentPageNum = state.currentPageNum + 1;
      state.lastPage = customers.last;
    },
    getCustomerDetails(
      state: CustomerState,
      action: PayloadAction<{ customer; id: number }>
    ) {
      const { customer, id } = action.payload;
      if (state.customerInfos[id]) {
        state.customerInfos[id] = { ...state.customerInfos[id], customer };
      } else state.customerInfos[id] = { customer };
    },
    editCustomer(
      state: CustomerState,
      action: PayloadAction<{ customer: Customer }>
    ) {
      const { customer } = action.payload;
      if (state.customerInfos[customer.id]) {
        state.customerInfos[customer.id].customer = customer;
      } else state.customerInfos[customer.id] = { customer };
    },
    getCustomersMini(
      state: CustomerState,
      action: PayloadAction<{ customers: CustomerMiniDTO[] }>
    ) {
      const { customers } = action.payload;
      state.customersMini = customers;
    },
    addCustomer(
      state: CustomerState,
      action: PayloadAction<{ customer: Customer }>
    ) {
      const { customer } = action.payload;
      state.customers.content = [...state.customers.content, customer];
    },
    deleteCustomer(
      state: CustomerState,
      action: PayloadAction<{ id: number }>
    ) {
      const { id } = action.payload;
      const customerIndex = state.customers.content.findIndex(
        (customer) => customer.id === id
      );
      state.customers.content.splice(customerIndex, 1);
    },
    setLoadingGet(
      state: CustomerState,
      action: PayloadAction<{ loading: boolean }>
    ) {
      const { loading } = action.payload;
      state.loadingGet = loading;
    }
  }
});

export const reducer = slice.reducer;

export const getCustomers =
  (criteria: SearchCriteria): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(slice.actions.setLoadingGet({ loading: true }));
      const customers = await api.post<Page<Customer>>(
        `${basePath}/search`,
        criteria
      );
      dispatch(slice.actions.getCustomers({ customers }));
    } finally {
      dispatch(slice.actions.setLoadingGet({ loading: false }));
    }
  };
export const getMoreCustomers =
  (criteria: SearchCriteria, pageNum: number): AppThunk =>
  async (dispatch) => {
    criteria = { ...criteria, pageNum };
    try {
      dispatch(slice.actions.setLoadingGet({ loading: true }));
      const customers = await api.post<Page<Customer>>(
        `${basePath}/search`,
        criteria
      );
      dispatch(slice.actions.getMoreCustomers({ customers }));
    } finally {
      dispatch(slice.actions.setLoadingGet({ loading: false }));
    }
  };

export const getCustomerDetails =
  (id: number): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.setLoadingGet({ loading: true }));
    const customer = await api.get<Customer>(`${basePath}/${id}`);
    dispatch(
      slice.actions.getCustomerDetails({
        id,
        customer
      })
    );
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  };

export const editCustomer =
  (id: number, customer): AppThunk =>
  async (dispatch) => {
    const customerResponse = await api.patch<Customer>(
      `${basePath}/${id}`,
      customer
    );
    dispatch(slice.actions.editCustomer({ customer: customerResponse }));
  };
export const getCustomersMini = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.setLoadingGet({ loading: true }));
  const customers = await api.get<CustomerMiniDTO[]>('customers/mini');
  dispatch(slice.actions.getCustomersMini({ customers }));
  dispatch(slice.actions.setLoadingGet({ loading: false }));
};
export const addCustomer =
  (customer): AppThunk =>
  async (dispatch) => {
    const customerResponse = await api.post<Customer>('customers', customer);
    dispatch(slice.actions.addCustomer({ customer: customerResponse }));
  };
export const deleteCustomer =
  (id: number): AppThunk =>
  async (dispatch) => {
    const customerResponse = await api.deletes<{ success: boolean }>(
      `customers/${id}`
    );
    const { success } = customerResponse;
    if (success) {
      dispatch(slice.actions.deleteCustomer({ id }));
    }
  };
export default slice;
