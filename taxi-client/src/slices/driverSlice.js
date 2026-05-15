import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:7500";
const SESSION_KEY = "tb_driver_session";

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : { driver: null, isLoggedIn: false };
  } catch {
    return { driver: null, isLoggedIn: false };
  }
}

function saveSession(driver) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ driver, isLoggedIn: true }));
  } catch {}
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export const newDriverThunk = createAsyncThunk(
 "driver/register",
 async (driverData, { rejectWithValue }) => {
   try {
     console.log("Sending driver register data:", driverData);
     const res = await axios.post(
       `${BASE_URL}/driverRegister`,
       driverData
     );
     console.log("Driver register response:", res.data);
     return res.data;
   } catch (err) {
     console.log("Driver register error:", err);
     console.log("Driver register error response:", err.response);
     return rejectWithValue(
       err.response?.data || {
         flag: false,
         serverMsg: "Driver register failed",
       }
     );
   }
 }
);
export const driverLoginThunk = createAsyncThunk(
 "driver/login",
 async (driverData, { rejectWithValue }) => {
   try {
     const res = await axios.post(`${BASE_URL}/driverLogin`, driverData);
     return res.data;
   } catch (err) {
     console.log("Driver login error:", err);
     return rejectWithValue(
       err.response?.data || {
         loginStatus: false,
         serverMsg: "Driver login failed",
       }
     );
   }
 }
);
const persisted = loadSession();

const driverInitialState = {
 driver: persisted.driver,
 msg: "",
 loading: false,
 isLoggedIn: persisted.isLoggedIn,
};
const driverSlice = createSlice({
 name: "driver",
 initialState: driverInitialState,
 reducers: {
    logout(state) {
     state.isLoggedIn = false;
     state.driver = null;
     state.msg = "";
     state.loading = false;
     clearSession();
   },
   updateDriver(state, action) {
     state.driver = { ...state.driver, ...action.payload };
     saveSession(state.driver);
   },
 },
 extraReducers: (builder) => {
   builder
     .addCase(newDriverThunk.pending, (state) => {
       state.loading = true;
       state.msg = "";
     })
     .addCase(newDriverThunk.fulfilled, (state, action) => {
       state.loading = false;
       state.msg = action.payload?.serverMsg || "";
     })
     .addCase(newDriverThunk.rejected, (state, action) => {
       state.loading = false;
       state.msg = action.payload?.serverMsg || "Driver registration failed";
     })
     .addCase(driverLoginThunk.pending, (state) => {
       state.loading = true;
       state.msg = "";
     })
     .addCase(driverLoginThunk.fulfilled, (state, action) => {
       state.loading = false;
       state.msg = action.payload?.serverMsg || "";
       state.isLoggedIn = !!action.payload?.flag;
       state.driver = action.payload?.driver || action.payload?.data || null;
       if (action.payload?.flag) {
         saveSession(state.driver);
       }
     })
     .addCase(driverLoginThunk.rejected, (state, action) => {
       state.loading = false;
       state.msg = action.payload?.serverMsg || "Driver login failed";
       state.isLoggedIn = false;
       state.driver = null;
     });
 },
});
export const { logout, updateDriver } = driverSlice.actions;
export default driverSlice.reducer;