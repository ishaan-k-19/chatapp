import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { adminLogin, adminLogout, getAdmin } from "../thunks/admin";

// Initial state for authentication
const initialState = {
  user: null, // Stores the user data, null initially
  isAdmin: false, // Admin status, default to false
  loader: true, // Loader state, indicating if the authentication process is ongoing
};

// Create the slice for authentication
const authSlice = createSlice({
  name: "auth", // Name of the slice
  initialState, // Initial state defined above
  reducers: {
      // Action when user exists
      userExists: (state, action) => {
          state.user = action.payload; // Set user data
          state.loader = false; // Hide loader after user data is set
      },
      // Action when user does not exist
      userNotExists: (state) => {
          state.user = null; // Set user data to null
          state.loader = false; // Hide loader
      },
  },

  extraReducers: (builder) => {
      builder
          // Admin login success
          .addCase(adminLogin.fulfilled, (state, action) => {
              state.isAdmin = true; // Set admin status to true
              toast.success(action.payload); // Show success toast
          })
          // Admin login failure
          .addCase(adminLogin.rejected, (state, action) => {
              state.isAdmin = false; // Set admin status to false
              toast.error(action.error.message); // Show error toast
          })
          // Get admin success
          .addCase(getAdmin.fulfilled, (state, action) => {
              state.isAdmin = action.payload ? true : false; // Check if the payload is truthy to set admin status
          })
          // Get admin failure
          .addCase(getAdmin.rejected, (state, action) => {
              state.isAdmin = false; // Set admin status to false on failure
          })
          // Admin logout success
          .addCase(adminLogout.fulfilled, (state, action) => {
              state.isAdmin = false; // Set admin status to false
              toast.success(action.payload); // Show success toast
          })
          // Admin logout failure
          .addCase(adminLogout.rejected, (state, action) => {
              state.isAdmin = true; // Keep admin status as true on failure (may want to change this logic)
              toast.error(action.error.message); // Show error toast
          });
  }
});

export default authSlice;
export const { userExists, userNotExists} = authSlice.actions;