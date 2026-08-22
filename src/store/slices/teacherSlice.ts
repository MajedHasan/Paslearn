import api from "@/lib/api";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

// ─── Types ───────────────────────────────────────────────
export interface TeacherProfile {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImageUrl?: string;
  };
  fullName?: string;
  username?: string;
  phoneNumber?: string;
  bio?: string;
  profileImageUrl?: string;
  domain?: string;
  status: string;
  selectedPlan?: any;
  selectedTemplate?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  // Add more as you build the backend
}

interface TeacherState {
  profile: TeacherProfile | null;
  stats: TeacherStats | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

// ─── Initial State ───────────────────────────────────────
const initialState: TeacherState = {
  profile: null,
  stats: null,
  loading: false,
  error: null,
  success: null,
};

// ─── Thunks ──────────────────────────────────────────────
export const fetchTeacherProfile = createAsyncThunk<
  TeacherProfile,
  void,
  { rejectValue: string }
>("teacher/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/teacher-profile");
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to load teacher profile"
    );
  }
});

export const updateTeacherProfile = createAsyncThunk<
  TeacherProfile,
  Partial<TeacherProfile>,
  { rejectValue: string }
>("teacher/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.patch("/teacher-profile", payload);
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update teacher profile"
    );
  }
});

export const fetchTeacherStats = createAsyncThunk<
  TeacherStats,
  void,
  { rejectValue: string }
>("teacher/fetchStats", async (_, { rejectWithValue }) => {
  try {
    // Adjust endpoint when you build the stats API
    const res = await api.get("/teacher-profile/stats");
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to load teacher stats"
    );
  }
});

// ─── Slice ───────────────────────────────────────────────
const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    clearTeacher: (state) => {
      state.profile = null;
      state.stats = null;
      state.loading = false;
      state.error = null;
      state.success = null;
    },
    clearTeacherError: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTeacherProfile
      .addCase(fetchTeacherProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(
        fetchTeacherProfile.fulfilled,
        (state, action: PayloadAction<TeacherProfile>) => {
          state.loading = false;
          state.profile = action.payload;
        }
      )
      .addCase(fetchTeacherProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load teacher profile";
      })
      // updateTeacherProfile
      .addCase(updateTeacherProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(
        updateTeacherProfile.fulfilled,
        (state, action: PayloadAction<TeacherProfile>) => {
          state.loading = false;
          state.profile = action.payload;
          state.success = "Teacher profile updated successfully";
        }
      )
      .addCase(updateTeacherProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update teacher profile";
      })
      // fetchTeacherStats
      .addCase(fetchTeacherStats.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(
        fetchTeacherStats.fulfilled,
        (state, action: PayloadAction<TeacherStats>) => {
          state.loading = false;
          state.stats = action.payload;
        }
      )
      .addCase(fetchTeacherStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load teacher stats";
      });
  },
});

export const { clearTeacher, clearTeacherError } = teacherSlice.actions;
export default teacherSlice.reducer;