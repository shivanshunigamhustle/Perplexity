import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: true,
        error: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        clearUser: (state) => {  // ✅ logout ke liye
            state.user = null
            state.error = null
        }
    }
})

export const { setUser, setLoading, setError, clearUser } = authSlice.actions
export default authSlice.reducer