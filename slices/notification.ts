import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from '../store';
import Notification from '../models/notification';
import api from '../utils/api';

const basePath = 'notifications';
interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: []
};

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    getNotifications(
      state: NotificationState,
      action: PayloadAction<{ notifications: Notification[] }>
    ) {
      const { notifications } = action.payload;
      state.notifications = notifications;
    },
    addNotification(
      state: NotificationState,
      action: PayloadAction<{ notification: Notification }>
    ) {
      const { notification } = action.payload;
      state.notifications = [...state.notifications, notification];
    },
    editNotification(
      state: NotificationState,
      action: PayloadAction<{ notification: Notification }>
    ) {
      const { notification } = action.payload;
      state.notifications = state.notifications.map((notification1) => {
        if (notification1.id === notification.id) {
          return notification;
        }
        return notification1;
      });
    },
    deleteNotification(
      state: NotificationState,
      action: PayloadAction<{ id: number }>
    ) {
      const { id } = action.payload;
      const notificationIndex = state.notifications.findIndex(
        (notification) => notification.id === id
      );
      state.notifications.splice(notificationIndex, 1);
    }
  }
});

export const reducer = slice.reducer;

export const getNotifications = (): AppThunk => async (dispatch) => {
  const notifications = await api.get<Notification[]>(basePath);
  dispatch(slice.actions.getNotifications({ notifications }));
};

export const editNotification =
  (id: number, notification): AppThunk =>
  async (dispatch) => {
    const notificationResponse = await api.patch<Notification>(
      `${basePath}/${id}`,
      notification
    );
    dispatch(
      slice.actions.editNotification({ notification: notificationResponse })
    );
  };

export default slice;
