import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from '../store';
import SetType from '../models/setType';
import api from '../utils/api';
import { revertAll } from '../utils/redux';

const basePath = 'multi-parts';

interface MultiPartState {
  multiParts: SetType[];
  miniMultiParts: SetType[];
  loadingMultiparts: boolean;
}

const initialState: MultiPartState = {
  multiParts: [],
  miniMultiParts: [],
  loadingMultiparts: false
};

const slice = createSlice({
  name: 'multiParts',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    getMultiParts(
      state: MultiPartState,
      action: PayloadAction<{ multiParts: SetType[] }>
    ) {
      const { multiParts } = action.payload;
      state.multiParts = multiParts;
    },
    getMiniMultiParts(
      state: MultiPartState,
      action: PayloadAction<{ multiParts: SetType[] }>
    ) {
      const { multiParts } = action.payload;
      state.miniMultiParts = multiParts;
    },
    addMultiParts(
      state: MultiPartState,
      action: PayloadAction<{ multiPart: SetType }>
    ) {
      const { multiPart } = action.payload;
      state.multiParts = [...state.multiParts, multiPart];
    },
    editMultiParts(
      state: MultiPartState,
      action: PayloadAction<{ multiPart: SetType }>
    ) {
      const { multiPart } = action.payload;
      state.multiParts = state.multiParts.map((multiPart1) => {
        if (multiPart1.id === multiPart.id) {
          return multiPart;
        }
        return multiPart1;
      });
    },
    deleteMultiParts(
      state: MultiPartState,
      action: PayloadAction<{ id: number }>
    ) {
      const { id } = action.payload;
      const multiPartIndex = state.multiParts.findIndex(
        (multiPart) => multiPart.id === id
      );
      state.multiParts.splice(multiPartIndex, 1);
    },
    setLoadingGet(
      state: MultiPartState,
      action: PayloadAction<{ loading: boolean }>
    ) {
      const { loading } = action.payload;
      state.loadingMultiparts = loading;
    }
  }
});

export const reducer = slice.reducer;

export const getMultiParts = (): AppThunk => async (dispatch) => {
  try {
    dispatch(slice.actions.setLoadingGet({ loading: true }));
    const multiParts = await api.get<SetType[]>(basePath);
    dispatch(slice.actions.getMultiParts({ multiParts }));
  } finally {
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  }
};
export const getMultiPartsMini = (): AppThunk => async (dispatch) => {
  try {
    dispatch(slice.actions.setLoadingGet({ loading: true }));
    const multiParts = await api.get<SetType[]>(`${basePath}/mini`);
    dispatch(slice.actions.getMiniMultiParts({ multiParts }));
  } finally {
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  }
};
export const addMultiParts =
  (multiPart): AppThunk =>
    async (dispatch) => {
      const multiPartResponse = await api.post<SetType>(basePath, multiPart);
      dispatch(slice.actions.addMultiParts({ multiPart: multiPartResponse }));
    };
export const editMultiParts =
  (id: number, multiPart): AppThunk =>
    async (dispatch) => {
      const multiPartResponse = await api.patch<SetType>(
        `${basePath}/${id}`,
        multiPart
      );
      dispatch(slice.actions.editMultiParts({ multiPart: multiPartResponse }));
    };
export const deleteMultiParts =
  (id: number): AppThunk =>
    async (dispatch) => {
      const multiPartResponse = await api.deletes<{ success: boolean }>(
        `${basePath}/${id}`
      );
      const { success } = multiPartResponse;
      if (success) {
        dispatch(slice.actions.deleteMultiParts({ id }));
      }
    };

export default slice;
