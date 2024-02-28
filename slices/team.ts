import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from '../store';
import Team, { TeamMiniDTO } from '../models/team';
import api from '../utils/api';
import { getInitialPage, Page, SearchCriteria } from '../models/page';
import { revertAll } from '../utils/redux';

const basePath = 'teams';

interface TeamState {
  teams: Page<Team>;
  teamInfos: { [key: number]: { team?: Team } };
  teamsMini: TeamMiniDTO[];
  currentPageNum: number;
  lastPage: boolean;
  loadingGet: boolean;
}

const initialState: TeamState = {
  teams: getInitialPage<Team>(),
  teamInfos: {},
  teamsMini: [],
  currentPageNum: 0,
  lastPage: true,
  loadingGet: false
};

const slice = createSlice({
  name: 'teams',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    getTeams(state: TeamState, action: PayloadAction<{ teams: Page<Team> }>) {
      const { teams } = action.payload;
      state.teams = teams;
      state.currentPageNum = 0;
      state.lastPage = teams.last;
    },
    getMoreTeams(
      state: TeamState,
      action: PayloadAction<{ teams: Page<Team> }>
    ) {
      const { teams } = action.payload;
      state.teams.content = state.teams.content.concat(teams.content);
      state.currentPageNum = state.currentPageNum + 1;
      state.lastPage = teams.last;
    },
    getTeamDetails(
      state: TeamState,
      action: PayloadAction<{ team; id: number }>
    ) {
      const { team, id } = action.payload;
      if (state.teamInfos[id]) {
        state.teamInfos[id] = { ...state.teamInfos[id], team };
      } else state.teamInfos[id] = { team };
    },
    editTeam(state: TeamState, action: PayloadAction<{ team: Team }>) {
      const { team } = action.payload;
      if (state.teamInfos[team.id]) {
        state.teamInfos[team.id].team = team;
      } else state.teamInfos[team.id] = { team };
    },
    getTeamsMini(
      state: TeamState,
      action: PayloadAction<{ teams: TeamMiniDTO[] }>
    ) {
      const { teams } = action.payload;
      state.teamsMini = teams;
    },
    addTeam(state: TeamState, action: PayloadAction<{ team: Team }>) {
      const { team } = action.payload;
      state.teams.content = [...state.teams.content, team];
    },
    deleteTeam(state: TeamState, action: PayloadAction<{ id: number }>) {
      const { id } = action.payload;
      const teamIndex = state.teams.content.findIndex((team) => team.id === id);
      state.teams.content.splice(teamIndex, 1);
    },
    setLoadingGet(
      state: TeamState,
      action: PayloadAction<{ loading: boolean }>
    ) {
      const { loading } = action.payload;
      state.loadingGet = loading;
    }
  }
});

export const reducer = slice.reducer;

export const getTeams =
  (criteria: SearchCriteria): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(slice.actions.setLoadingGet({ loading: true }));
      const teams = await api.post<Page<Team>>(`${basePath}/search`, criteria);
      dispatch(slice.actions.getTeams({ teams }));
    } finally {
      dispatch(slice.actions.setLoadingGet({ loading: false }));
    }
  };
export const getMoreTeams =
  (criteria: SearchCriteria, pageNum: number): AppThunk =>
  async (dispatch) => {
    criteria = { ...criteria, pageNum };
    try {
      dispatch(slice.actions.setLoadingGet({ loading: true }));
      const teams = await api.post<Page<Team>>(`${basePath}/search`, criteria);
      dispatch(slice.actions.getMoreTeams({ teams }));
    } finally {
      dispatch(slice.actions.setLoadingGet({ loading: false }));
    }
  };
export const getTeamDetails =
  (id: number): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.setLoadingGet({ loading: true }));
    const team = await api.get<Team>(`${basePath}/${id}`);
    dispatch(
      slice.actions.getTeamDetails({
        id,
        team
      })
    );
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  };

export const editTeam =
  (id: number, team): AppThunk =>
  async (dispatch) => {
    const teamResponse = await api.patch<Team>(`${basePath}/${id}`, team);
    dispatch(slice.actions.editTeam({ team: teamResponse }));
  };

export const getTeamsMini = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.setLoadingGet({ loading: true }));
  const teams = await api.get<TeamMiniDTO[]>('teams/mini');
  dispatch(slice.actions.getTeamsMini({ teams }));
  dispatch(slice.actions.setLoadingGet({ loading: false }));
};
export const addTeam =
  (team): AppThunk =>
  async (dispatch) => {
    const teamResponse = await api.post<Team>('teams', team);
    dispatch(slice.actions.addTeam({ team: teamResponse }));
  };
export const deleteTeam =
  (id: number): AppThunk =>
  async (dispatch) => {
    const teamResponse = await api.deletes<{ success: boolean }>(`teams/${id}`);
    const { success } = teamResponse;
    if (success) {
      dispatch(slice.actions.deleteTeam({ id }));
    }
  };

export default slice;
