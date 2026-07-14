import { createSlice, configureStore } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  vehicles: [],
  activeVehicle: null,
  lastScan: null,
  scanHistory: [],
  subscription: { tier: 'FREE', startDate: null },
  isConnectedToOBD: false,
  connectedDevice: null,
  loading: false,
  error: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.subscription = { tier: 'FREE', startDate: null };
      state.vehicles = [];
      state.activeVehicle = null;
      state.lastScan = null;
      state.scanHistory = [];
    },
    addVehicle: (state, action) => {
      state.vehicles.push(action.payload);
      if (state.vehicles.length === 1) {
        state.activeVehicle = action.payload;
      }
    },
    removeVehicle: (state, action) => {
      state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
      if (state.activeVehicle?.id === action.payload) {
        state.activeVehicle = state.vehicles[0] || null;
      }
    },
    updateVehicle: (state, action) => {
      const idx = state.vehicles.findIndex(v => v.id === action.payload.id);
      if (idx !== -1) {
        state.vehicles[idx] = { ...state.vehicles[idx], ...action.payload };
        if (state.activeVehicle?.id === action.payload.id) {
          state.activeVehicle = state.vehicles[idx];
        }
      }
    },
    setActiveVehicle: (state, action) => {
      state.activeVehicle = action.payload;
    },
    setLastScan: (state, action) => {
      state.lastScan = action.payload;
      state.scanHistory.unshift(action.payload);
      if (state.scanHistory.length > 500) {
        state.scanHistory = state.scanHistory.slice(0, 500);
      }
    },
    setScanHistory: (state, action) => {
      state.scanHistory = action.payload;
    },
    setSubscription: (state, action) => {
      state.subscription = action.payload;
    },
    setOBDConnection: (state, action) => {
      state.isConnectedToOBD = action.payload.connected;
      state.connectedDevice = action.payload.device || null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUser,
  logout,
  addVehicle,
  removeVehicle,
  updateVehicle,
  setActiveVehicle,
  setLastScan,
  setScanHistory,
  setSubscription,
  setOBDConnection,
  setLoading,
  setError,
} = appSlice.actions;

const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

export default store;
