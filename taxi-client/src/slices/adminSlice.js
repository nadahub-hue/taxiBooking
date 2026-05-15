import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const SESSION_KEY = "tb_admin_session";

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : { admin: null, isLoggedIn: false };
  } catch {
    return { admin: null, isLoggedIn: false };
  }
}

function saveSession(admin) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ admin, isLoggedIn: true }));
  } catch {}
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export const adminLoginThunk = createAsyncThunk("admin/login",
  async ({ adminEmail, adminPassword }, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:7500/adminLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, adminPassword })
      });

      const data = await res.json(); 
      return data;
    } catch (err) {
      return rejectWithValue({ loginStatus: false, serverMsg: "Login failed" });
    }
  }
);

const persisted = loadSession();

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    msg: "",
    admin: persisted.admin,
    loading: false,
    isLoggedIn: persisted.isLoggedIn
  },
  reducers: {
    logout(state) {
      state.isLoggedIn = false;
      state.admin = null;
      state.msg = "";
      clearSession();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLoginThunk.pending, (state) => {
        state.loading = true;
        state.msg = "";
      })
      .addCase(adminLoginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.msg = action.payload.serverMsg || "";
        state.isLoggedIn = !!action.payload.loginStatus;
        if (action.payload.loginStatus) {
          state.admin = action.payload.admin;
          saveSession(action.payload.admin);
        }
      })
      .addCase(adminLoginThunk.rejected, (state, action) => {
        state.loading = false;
        state.msg = action.payload?.serverMsg || "Admin login failed";
        state.isLoggedIn = false;
      });
  }
});

export const { logout } = adminSlice.actions;
export default adminSlice.reducer;
