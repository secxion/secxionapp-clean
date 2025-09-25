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
            state.user = action.payload;
            state.isLoggedIn = action.payload !== null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isLoggedIn = false;
        },
        clearState: (state) => {
            state.user = null;
            state.isLoggedIn = false;
            state.loading = false;
        },
    },
});

export const { setUserDetails, setLoading, logout, clearState } = userSlice.actions;
export default userSlice.reducer;