import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from '../store';
import Relation from '../models/relation';
import api from '../utils/api';

const basePath = 'relations';
interface RelationState {
  relationsByWorkOrder: { [id: number]: Relation[] };
}

const initialState: RelationState = {
  relationsByWorkOrder: {}
};

const slice = createSlice({
  name: 'relations',
  initialState,
  reducers: {
    getRelations(
      state: RelationState,
      action: PayloadAction<{ id: number; relations: Relation[] }>
    ) {
      const { relations, id } = action.payload;
      state.relationsByWorkOrder[id] = relations;
    },
    createRelation(
      state: RelationState,
      action: PayloadAction<{
        workOrderId: number;
        relation: Relation;
      }>
    ) {
      const { relation, workOrderId } = action.payload;
      if (state.relationsByWorkOrder[workOrderId]) {
        state.relationsByWorkOrder[workOrderId].push(relation);
      } else state.relationsByWorkOrder[workOrderId] = [relation];
    },
    deleteRelation(
      state: RelationState,
      action: PayloadAction<{
        workOrderId: number;
        id: number;
      }>
    ) {
      const { id, workOrderId } = action.payload;
      state.relationsByWorkOrder[workOrderId] = state.relationsByWorkOrder[
        workOrderId
      ].filter((relation) => relation.id !== id);
    }
  }
});

export const reducer = slice.reducer;

export const getRelations =
  (id: number): AppThunk =>
  async (dispatch) => {
    const relations = await api.get<Relation[]>(`${basePath}/work-order/${id}`);
    dispatch(slice.actions.getRelations({ id, relations }));
  };

export const createRelation =
  (
    id: number,
    relation: { child: { id: number }; relationType: string }
  ): AppThunk =>
  async (dispatch) => {
    const relationResponse = await api.post<Relation>(`${basePath}`, {
      ...relation,
      parent: { id }
    });
    dispatch(
      slice.actions.createRelation({
        workOrderId: id,
        relation: relationResponse
      })
    );
  };

export const deleteRelation =
  (workOrderId: number, id: number): AppThunk =>
  async (dispatch) => {
    const response = await api.deletes<{ success: boolean }>(
      `${basePath}/${id}`
    );
    const { success } = response;
    if (success) {
      dispatch(slice.actions.deleteRelation({ workOrderId, id }));
    }
  };

export default slice;
