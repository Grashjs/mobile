import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from '../store';
import Request from '../models/request';
import api from '../utils/api';
import WorkOrder from '../models/workOrder';
import { getInitialPage, Page, SearchCriteria } from '../models/page';

const basePath = 'requests';

interface RequestState {
  requests: Page<Request>;
  singleRequest: Request;
  currentPageNum: number;
  lastPage: boolean;
  loadingGet: boolean;
}

const initialState: RequestState = {
  requests: getInitialPage<Request>(),
  singleRequest: null,
  currentPageNum: 0,
  lastPage: true,
  loadingGet: false
};

const slice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    getRequests(
      state: RequestState,
      action: PayloadAction<{ requests: Page<Request> }>
    ) {
      const { requests } = action.payload;
      state.requests = requests;
      state.currentPageNum = 0;
      state.lastPage = requests.last;
    },
    getMoreRequests(
      state: RequestState,
      action: PayloadAction<{ requests: Page<Request> }>
    ) {
      const { requests } = action.payload;
      state.requests.content = state.requests.content.concat(requests.content);
      state.currentPageNum = state.currentPageNum + 1;
      state.lastPage = requests.last;
    },
    getSingleRequest(
      state: RequestState,
      action: PayloadAction<{ request: Request }>
    ) {
      const { request } = action.payload;
      state.singleRequest = request;
    },
    addRequest(
      state: RequestState,
      action: PayloadAction<{ request: Request }>
    ) {
      const { request } = action.payload;
      state.requests.content = [...state.requests.content, request];
    },
    editRequest(
      state: RequestState,
      action: PayloadAction<{ request: Request }>
    ) {
      const { request } = action.payload;
      const inContent = state.requests.content.some(
        (request1) => request1.id === request.id
      );
      if (inContent) {
        state.requests.content = state.requests.content.map((request1) => {
          if (request1.id === request.id) {
            return request;
          }
          return request1;
        });
      } else {
        state.singleRequest = request;
      }
    },
    deleteRequest(state: RequestState, action: PayloadAction<{ id: number }>) {
      const { id } = action.payload;
      const requestIndex = state.requests.content.findIndex(
        (request) => request.id === id
      );
      if (requestIndex !== -1) state.requests.content.splice(requestIndex, 1);
    },
    approveRequest(
      state: RequestState,
      action: PayloadAction<{ id: number; workOrder: WorkOrder }>
    ) {
      const { id, workOrder } = action.payload;
      state.requests.content = state.requests.content.map((request) => {
        if (request.id === id) {
          return { ...request, workOrder };
        }
        return request;
      });
    },
    cancelRequest(state: RequestState, action: PayloadAction<{ id: number }>) {
      const { id } = action.payload;
      state.requests.content = state.requests.content.map((request) => {
        if (request.id === id) {
          return { ...request, cancelled: true };
        }
        return request;
      });
    },
    setLoadingGet(
      state: RequestState,
      action: PayloadAction<{ loading: boolean }>
    ) {
      const { loading } = action.payload;
      state.loadingGet = loading;
    },
    clearSingleRequest(state: RequestState, action: PayloadAction<{}>) {
      state.singleRequest = null;
    }
  }
});

export const reducer = slice.reducer;

export const getRequests =
  (criteria: SearchCriteria): AppThunk =>
    async (dispatch) => {
      try {
        dispatch(slice.actions.setLoadingGet({ loading: true }));
        const requests = await api.post<Page<Request>>(
          `${basePath}/search`,
          criteria
        );
        dispatch(slice.actions.getRequests({ requests }));
      } finally {
        dispatch(slice.actions.setLoadingGet({ loading: false }));
      }
    };
export const getMoreRequests =
  (criteria: SearchCriteria, pageNum: number): AppThunk =>
    async (dispatch) => {
      criteria = { ...criteria, pageNum };
      try {
        dispatch(slice.actions.setLoadingGet({ loading: true }));
        const requests = await api.post<Page<Request>>(
          `${basePath}/search`,
          criteria
        );
        dispatch(slice.actions.getMoreRequests({ requests }));
      } finally {
        dispatch(slice.actions.setLoadingGet({ loading: false }));
      }
    };
export const getSingleRequest =
  (id: number): AppThunk =>
    async (dispatch) => {
      dispatch(slice.actions.setLoadingGet({ loading: true }));
      const request = await api.get<Request>(`${basePath}/${id}`);
      dispatch(slice.actions.getSingleRequest({ request }));
      dispatch(slice.actions.setLoadingGet({ loading: false }));
    };
export const addRequest =
  (request): AppThunk =>
    async (dispatch) => {
      const requestResponse = await api.post<Request>(basePath, request);
      dispatch(slice.actions.addRequest({ request: requestResponse }));
    };
export const editRequest =
  (id: number, request): AppThunk =>
    async (dispatch) => {
      const requestResponse = await api.patch<Request>(
        `${basePath}/${id}`,
        request
      );
      dispatch(slice.actions.editRequest({ request: requestResponse }));
    };
export const deleteRequest =
  (id: number): AppThunk =>
    async (dispatch) => {
      const requestResponse = await api.deletes<{ success: boolean }>(
        `${basePath}/${id}`
      );
      const { success } = requestResponse;
      if (success) {
        dispatch(slice.actions.deleteRequest({ id }));
      }
    };

export const approveRequest =
  (id: number): AppThunk =>
    async (dispatch) => {
      const workOrder = await api.patch<WorkOrder>(
        `${basePath}/${id}/approve`,
        {}
      );
      dispatch(slice.actions.approveRequest({ id, workOrder }));
      return workOrder.id;
    };
export const cancelRequest =
  (id: number): AppThunk =>
    async (dispatch) => {
      const request = await api.patch<WorkOrder>(`${basePath}/${id}/cancel`, {});
      dispatch(slice.actions.cancelRequest({ id }));
    };

export const clearSingleRequest = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.clearSingleRequest({}));
};
export default slice;
