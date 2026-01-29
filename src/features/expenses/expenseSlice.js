import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/expenses/';

const initialState = {
    expenses: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

export const getExpenses = createAsyncThunk('expenses/getAll', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(API_URL, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const createExpense = createAsyncThunk('expenses/create', async (expenseData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post(API_URL, expenseData, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const expenseSlice = createSlice({
    name: 'expense',
    initialState,
    reducers: {
        reset: (state) => initialState
    },
    extraReducers: (builder) => {
        builder
            .addCase(getExpenses.fulfilled, (state, action) => {
                state.expenses = action.payload;
            })
            .addCase(createExpense.fulfilled, (state, action) => {
                state.expenses.push(action.payload);
            });
    }
});

export const { reset } = expenseSlice.actions;
export default expenseSlice.reducer;
