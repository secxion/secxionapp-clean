import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    loading: false,
    isLoggedIn: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserDetails: (state, action) => {
            if (process.env.NODE_ENV === 'development') {
                console.log("Redux User Slice: Setting user details:", action.payload);
            }
            state.user = action.payload;
            state.isLoggedIn = action.payload !== null;
        },
        setLoading: (state, action) => {
            if (process.env.NODE_ENV === 'development') {
                console.log("Redux User Slice: Setting loading:", action.payload);
            }
            state.loading = action.payload;
        },
        logout: (state) => {
            if (process.env.NODE_ENV === 'development') {
                console.log("Redux User Slice: Logging out user");
            }
            state.user = null;
            state.isLoggedIn = false;
        },
        clearState: (state) => {
            if (process.env.NODE_ENV === 'development') {
                console.log("Redux User Slice: Clearing state");
            }
            state.user = null;
            state.isLoggedIn = false;
            state.loading = false;
        },
    },
});

export const { setUserDetails, setLoading, logout, clearState } = userSlice.actions;
export default userSlice.reducer;