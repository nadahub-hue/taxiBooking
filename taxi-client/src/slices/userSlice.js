import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const SESSION_KEY = "tb_user_session";

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : { user: null, isLoggedIn: false };
  } catch {
    return { user: null, isLoggedIn: false };
  }
}

function saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user, isLoggedIn: true }));
  } catch {}
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export const newUserThunk = createAsyncThunk(
  "user/register",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:7500/userRegister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      return data; 
    } catch (err) {
      return rejectWithValue({ flag: false, msg: "Register failed" });
    }
  }
);

export const loginThunk = createAsyncThunk(
  "user/login",
  async ({ email, pwd }, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:7500/userLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: email, userPassword: pwd })
      });

      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue({ loginStatus: false, msg: "Login failed" });
    }
  }
);

const persisted = loadSession();

const userSlice = createSlice({
  name: "user",
  initialState: {
    msg: "",
    user: persisted.user,
    loading: false,
    isLoggedIn: persisted.isLoggedIn
  },
  reducers: {
    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
      state.msg = "";
      clearSession();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(newUserThunk.pending, (state) => {
        state.loading = true;
        state.msg = "";
      })
      .addCase(newUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.msg = action.payload.serverMsg || "";
      })
      .addCase(newUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.msg = action.payload?.serverMsg || "Registration failed";
      });

    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.msg = "";
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.msg = action.payload.serverMsg || "";
        const ok = !!(action.payload.loginStatus || action.payload.flag);
        state.isLoggedIn = ok;
        if (ok && action.payload.user) {
          state.user = action.payload.user;
          saveSession(action.payload.user);
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.msg = action.payload?.msg || "Login failed";
        state.isLoggedIn = false;
      });
  }
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
