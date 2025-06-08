import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
//Creates a user slice in order to save data for profile use
import { loginUser } from '../../services/apiService.js';

const initialState = {
    currentUser: JSON.parse(localStorage.getItem("currentUser")) || null, // Load from localStorage
    loading: false,
    error: null,
};

// Async for logging in
export const userLogin = createAsyncThunk(
    'user/login',
    async ({ username, password }, thunkAPI) => {
        try {
            const user = await loginUser(username, password);
            return user; // Redux stores user data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true;
        },
        signInSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        signInFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        signOut: (state) => {
            state.currentUser = null;
            localStorage.removeItem("currentUser"); // Remove from localStorage
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(userLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(userLogin.fulfilled, (state, action) => {
                state.currentUser = action.payload;
                state.loading = false;
            })
            .addCase(userLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { signInStart, signInSuccess, signInFailure, signOut } = userSlice.actions;
export default userSlice.reducer;