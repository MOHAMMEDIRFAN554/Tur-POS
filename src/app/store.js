import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import bookingReducer from '../features/bookings/bookingSlice';
import spaceReducer from '../features/spaces/spaceSlice';
import expenseReducer from '../features/expenses/expenseSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        bookings: bookingReducer,
        spaces: spaceReducer,
        expenses: expenseReducer,
    },
});
