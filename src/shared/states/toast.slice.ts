import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "success" | "error";

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastState {
    toasts: Toast[];
}

const initialState: ToastState = { toasts: [] };

// UI notifications only (no server data). Rendered by ToastViewport inside AppLayout.
const toastSlice = createSlice({
    name: "toasts",
    initialState,
    reducers: {
        showToast: {
            reducer: (state, action: PayloadAction<Toast>) => {
                state.toasts.push(action.payload);
            },
            prepare: (type: ToastType, message: string) => ({ payload: { id: nanoid(), type, message } }),
        },
        dismissToast: (state, action: PayloadAction<string>) => {
            state.toasts = state.toasts.filter((t) => t.id !== action.payload);
        },
    },
});

export const { showToast, dismissToast } = toastSlice.actions;
export const toastReducer = toastSlice.reducer;
