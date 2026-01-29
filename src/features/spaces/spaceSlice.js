import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/spaces/';

const initialState = {
    spaces: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

export const getSpaces = createAsyncThunk('spaces/getAll', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(API_URL, config);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const createSpace = createAsyncThunk('spaces/create', async (spaceData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post(API_URL, spaceData, config);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const deleteSpace = createAsyncThunk('spaces/delete', async (id, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(API_URL + id, config);
        return id;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const updateSpace = createAsyncThunk('spaces/update', async ({ id, spaceData }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.put(API_URL + id, spaceData, config);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const spaceSlice = createSlice({
    name: 'space',
    initialState,
    reducers: {
        reset: (state) => initialState
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSpaces.pending, (state) => { state.isLoading = true; })
            .addCase(getSpaces.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.spaces = action.payload;
            })
            .addCase(getSpaces.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createSpace.fulfilled, (state, action) => {
                state.spaces.push(action.payload);
            })
            .addCase(deleteSpace.fulfilled, (state, action) => {
                state.spaces = state.spaces.filter((space) => space._id !== action.payload);
            })
            .addCase(updateSpace.fulfilled, (state, action) => {
                const index = state.spaces.findIndex(space => space._id === action.payload._id);
                if (index !== -1) {
                    state.spaces[index] = action.payload;
                }
            });
    }
});

export const { reset } = spaceSlice.actions;
export default spaceSlice.reducer;
