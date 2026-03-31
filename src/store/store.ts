import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth/states/auth.slice";
import { registerReducer } from "../features/auth/states/register.slice";
import { orderReducer } from "../features/orders/states/order.slice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        register: registerReducer,
        orders:orderReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;