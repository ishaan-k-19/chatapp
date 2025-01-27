import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./reducers/auth";
import api from "./api/api";
import miscSlice from "./reducers/misc";
import chatSlice from "./reducers/chat";


const store = configureStore({
    reducer: {
        [authSlice.name]: authSlice.reducer, // User authentication state
        [miscSlice.name]: miscSlice.reducer, // UI modal and state flags
        [chatSlice.name]: chatSlice.reducer, // Chat-related state
        [api.reducerPath]: api.reducer, // API state managed by RTK Query
    },
    middleware: (getDefaultMiddleware) => [
        ...getDefaultMiddleware(), 
        api.middleware, // Include the API middleware for query caching, etc.
    ],
});

export default store;