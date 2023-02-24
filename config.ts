export const googleMapsConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_KEY
};
export const apiUrl = process.env.REACT_APP_API_URL ?? 'http://localhost:8080/';
export const googleTrackingId = process.env.REACT_APP_GOOGLE_TRACKING_ID;
export const IS_LOCALHOST = apiUrl === 'http://localhost:8080/';
