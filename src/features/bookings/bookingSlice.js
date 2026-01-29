import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/bookings/';

const initialState = {
    bookings: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

export const createBooking = createAsyncThunk('bookings/create', async (bookingData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post(API_URL, bookingData, config);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const createBookingBatch = createAsyncThunk('bookings/createBatch', async (batchData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post(API_URL + 'batch', batchData, config);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const getBookings = createAsyncThunk('bookings/getAll', async (date, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(API_URL + (date ? `?date=${date}` : ''), config);
        // Returns list of bookings
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Update Booking Payment
export const updateBookingPayment = createAsyncThunk('bookings/updatePayment', async ({ id, paymentData }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.put(API_URL + id + '/pay', paymentData, config);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createBooking.pending, (state) => { state.isLoading = true })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.bookings.push(action.payload);
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createBookingBatch.pending, (state) => { state.isLoading = true })
            .addCase(createBookingBatch.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.bookings.push(...action.payload);
            })
            .addCase(createBookingBatch.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getBookings.pending, (state) => { state.isLoading = true })
            .addCase(getBookings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.bookings = action.payload;
            })
            .addCase(getBookings.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateBookingPayment.fulfilled, (state, action) => {
                const index = state.bookings.findIndex(b => b._id === action.payload._id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
            });
    }
});

export const { reset } = bookingSlice.actions;
export default bookingSlice.reducer;
