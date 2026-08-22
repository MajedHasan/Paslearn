import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import teacherReducer from "./slices/teacherSlice";

// Define the store with reducers
const store = configureStore({
  reducer: {
    user: userReducer,
    teacher: teacherReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
