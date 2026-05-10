import api from "@/lib/api";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  signupWithEmailAndPassword,
  signinWithEmailAndPassword,
  signupWithGoogle,
  signinWithGoogle,
} from "@/lib/firebaseAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFriendlyAuthError } from "@/lib/authErrors";

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  profileImageUrl?: string;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UserState {
  currentUser: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  success: string | null; // ✅ success messages
  redirectPath: string | null;
}

const storageUserKey = "currentUser";
const storageAccessKey = "accessToken";
const storageRefreshKey = "refreshToken";

/**
 * safeStorage - tiny wrapper around localStorage that no-ops on server.
 * Keeps your existing logic but prevents SSR crashes (localStorage undefined).
 */
const safeStorage = {
  get: (key: string): string | null =>
    typeof window === "undefined" ? null : localStorage.getItem(key),
  set: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },
  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};

const getStoredUser = (): User | null => {
  const u = safeStorage.get(storageUserKey);
  return u ? JSON.parse(u) : null;
};

const roleRedirectMap: Record<string, string> = {
  student: "/student",
  teacher: "/teacher",
  admin: "/admin",
};

const initialState: UserState = {
  currentUser: getStoredUser(),
  accessToken: safeStorage.get(storageAccessKey),
  refreshToken: safeStorage.get(storageRefreshKey),
  isAuthenticated: !!safeStorage.get(storageAccessKey),
  loading: false,
  error: null,
  success: null,
  redirectPath: null,
};

// --- LOGIN ---
export const loginUser = createAsyncThunk<
  AuthPayload & { message: string },
  { method: "email" | "google"; email?: string; password?: string },
  { rejectValue: string }
>("user/login", async (credentials, { rejectWithValue }) => {
  try {
    let user;
    if (credentials.method === "email") {
      if (!credentials.email || !credentials.password)
        throw new Error("Email and password required");
      user = await signinWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
    } else {
      user = await signinWithGoogle();
    }

    const { data } = await api.post("/auth/login", {
      email: user.email,
      password: credentials.password || "firebase-google",
    });

    safeStorage.set(storageUserKey, JSON.stringify(data.user));
    safeStorage.set(storageAccessKey, data.accessToken);
    safeStorage.set(storageRefreshKey, data.refreshToken);

    return { ...data, message: "Login successful" };
  } catch (err: any) {
    return rejectWithValue(
      getFriendlyAuthError(
        err.response?.data?.message || err.message || "Login failed"
      )
    );
  }
});

// --- REGISTER ---
export const registerUser = createAsyncThunk<
  any & { message: string },
  {
    method: "email" | "google";
    email?: string;
    password?: string;
    name?: string;
    role?: string;
  },
  { rejectValue: string }
>("user/register", async (newUser, { rejectWithValue }) => {
  try {
    let user;
    if (newUser.method === "email") {
      if (!newUser.email || !newUser.password)
        throw new Error("Email and password required");
      user = await signupWithEmailAndPassword(
        newUser.email,
        newUser.password,
        newUser.name
      );
    } else {
      user = await signupWithGoogle();
    }

    const { data } = await api.post("/auth/register", {
      email: user.email,
      password: newUser.password || "firebase-google",
      name: newUser.name || user.displayName,
      role: newUser.role,
    });

    return { ...data, message: "Registration successful" };
  } catch (err: any) {
    return rejectWithValue(
      getFriendlyAuthError(
        err.response?.data?.message || err.message || "Registration failed"
      )
    );
  }
});

// --- LOGOUT ---
export const logoutUser = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>("user/logout", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { user: UserState };
    const refreshToken = state.user.refreshToken;

    // Backend logout
    await api.post("/auth/logout", { refreshToken });

    // Firebase logout
    await signOut(auth);

    // Clear localStorage
    safeStorage.remove(storageUserKey);
    safeStorage.remove(storageAccessKey);
    safeStorage.remove(storageRefreshKey);

    return { message: "Logout successful" };
  } catch (err: any) {
    return rejectWithValue(
      getFriendlyAuthError(
        err.response?.data?.message || err.message || "Logout failed"
      )
    );
  }
});

// --- SLICE ---
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.currentUser = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.success = null;
      state.redirectPath = null;
      safeStorage.remove(storageUserKey);
      safeStorage.remove(storageAccessKey);
      safeStorage.remove(storageRefreshKey);
    },
    clearError: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
        state.redirectPath = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthPayload & { message: string }>) => {
          state.currentUser = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          state.loading = false;
          state.success = action.payload.message;
          state.redirectPath = roleRedirectMap[action.payload.user.role] || "/";
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
        state.success = null;
        state.redirectPath = null;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<any & { message: string }>) => {
          state.loading = false;
          state.success = action.payload.message;
        }
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
        state.success = null;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(
        logoutUser.fulfilled,
        (state, action: PayloadAction<{ message: string }>) => {
          state.currentUser = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          state.loading = false;
          state.error = null;
          state.success = action.payload.message;
          state.redirectPath = null;
        }
      )
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Logout failed";
        state.success = null;
      });
  },
});

export const { clearAuth, clearError } = userSlice.actions;
export default userSlice.reducer;
