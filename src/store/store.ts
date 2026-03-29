import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth/states/auth.slice";
import { registerReducer } from "../features/auth/states/register.slice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        register: registerReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;