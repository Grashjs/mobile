import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from '../store';
import { Vendor, VendorMiniDTO } from '../models/vendor';
import api from '../utils/api';
import { getInitialPage, Page, SearchCriteria } from '../models/page';
import { revertAll } from '../utils/redux';

const basePath = 'vendors';

interface VendorState {
  vendors: Page<Vendor>;
  vendorInfos: { [key: number]: { vendor?: Vendor } };
  vendorsMini: VendorMiniDTO[];
  currentPageNum: number;
  lastPage: boolean;
  loadingGet: boolean;
}

const initialState: VendorState = {
  vendors: getInitialPage<Vendor>(),
  vendorInfos: {},
  vendorsMini: [],
  currentPageNum: 0,
  lastPage: true,
  loadingGet: false
};

const slice = createSlice({
  name: 'vendors',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    getVendors(
      state: VendorState,
      action: PayloadAction<{ vendors: Page<Vendor> }>
    ) {
      const { vendors } = action.payload;
      state.vendors = vendors;
      state.currentPageNum = 0;
      state.lastPage = vendors.last;
    },
    getMoreVendors(
      state: VendorState,
      action: PayloadAction<{ vendors: Page<Vendor> }>
    ) {
      const { vendors } = action.payload;
      state.vendors.content = state.vendors.content.concat(vendors.content);
      state.currentPageNum = state.currentPageNum + 1;
      state.lastPage = vendors.last;
    },
    getVendorDetails(
      state: VendorState,
      action: PayloadAction<{ vendor; id: number }>
    ) {
      const { vendor, id } = action.payload;
      if (state.vendorInfos[id]) {
        state.vendorInfos[id] = { ...state.vendorInfos[id], vendor };
      } else state.vendorInfos[id] = { vendor };
    },
    editVendor(state: VendorState, action: PayloadAction<{ vendor: Vendor }>) {
      const { vendor } = action.payload;
      if (state.vendorInfos[vendor.id]) {
        state.vendorInfos[vendor.id].vendor = vendor;
      } else state.vendorInfos[vendor.id] = { vendor };
    },
    getVendorsMini(
      state: VendorState,
      action: PayloadAction<{ vendors: VendorMiniDTO[] }>
    ) {
      const { vendors } = action.payload;
      state.vendorsMini = vendors;
    },
    addVendor(state: VendorState, action: PayloadAction<{ vendor: Vendor }>) {
      const { vendor } = action.payload;
      state.vendors.content = [...state.vendors.content, vendor];
    },
    deleteVendor(state: VendorState, action: PayloadAction<{ id: number }>) {
      const { id } = action.payload;
      const vendorIndex = state.vendors.content.findIndex(
        (vendor) => vendor.id === id
      );
      state.vendors.content.splice(vendorIndex, 1);
    },
    setLoadingGet(
      state: VendorState,
      action: PayloadAction<{ loading: boolean }>
    ) {
      const { loading } = action.payload;
      state.loadingGet = loading;
    }
  }
});

export const reducer = slice.reducer;

export const getVendors =
  (criteria: SearchCriteria): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(slice.actions.setLoadingGet({ loading: true }));
      const vendors = await api.post<Page<Vendor>>(
        `${basePath}/search`,
        criteria
      );
      dispatch(slice.actions.getVendors({ vendors }));
    } finally {
      dispatch(slice.actions.setLoadingGet({ loading: false }));
    }
  };
export const getMoreVendors =
  (criteria: SearchCriteria, pageNum: number): AppThunk =>
  async (dispatch) => {
    criteria = { ...criteria, pageNum };
    try {
      dispatch(slice.actions.setLoadingGet({ loading: true }));
      const vendors = await api.post<Page<Vendor>>(
        `${basePath}/search`,
        criteria
      );
      dispatch(slice.actions.getMoreVendors({ vendors }));
    } finally {
      dispatch(slice.actions.setLoadingGet({ loading: false }));
    }
  };
export const getVendorDetails =
  (id: number): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.setLoadingGet({ loading: true }));
    const vendor = await api.get<Vendor>(`${basePath}/${id}`);
    dispatch(
      slice.actions.getVendorDetails({
        id,
        vendor
      })
    );
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  };

export const editVendor =
  (id: number, vendor): AppThunk =>
  async (dispatch) => {
    const vendorResponse = await api.patch<Vendor>(`${basePath}/${id}`, vendor);
    dispatch(slice.actions.editVendor({ vendor: vendorResponse }));
  };
export const getVendorsMini = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.setLoadingGet({ loading: true }));
  const vendors = await api.get<Vendor[]>('vendors/mini');
  dispatch(slice.actions.getVendorsMini({ vendors }));
  dispatch(slice.actions.setLoadingGet({ loading: false }));
};
export const addVendor =
  (vendor): AppThunk =>
  async (dispatch) => {
    const vendorResponse = await api.post<Vendor>('vendors', vendor);
    dispatch(slice.actions.addVendor({ vendor: vendorResponse }));
  };
export const deleteVendor =
  (id: number): AppThunk =>
  async (dispatch) => {
    const vendorResponse = await api.deletes<{ success: boolean }>(
      `vendors/${id}`
    );
    const { success } = vendorResponse;
    if (success) {
      dispatch(slice.actions.deleteVendor({ id }));
    }
  };

export default slice;
