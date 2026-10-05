import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LoginRequest } from '../interfaces/login.request';
import { postLogin } from '../apis/post-login.action';
import axios from "axios";
import { getMeApi } from "../apis/get-me.api";
import { CurrentUser } from "../interfaces/me.response";
import { getApiErrorMessage } from "../../../shared/utils/apiError";

// idle → loading → ready | error. Permission checks wait for "ready" instead of treating "no user yet" as "no access".
export type MeStatus = "idle" | "loading" | "ready" | "error";

interface AuthState {
    token: string | null;
    email: string | null;
    loading: boolean;
    error: string | null;
    // GET /auth/me: user, role and permissions. Never persisted; fetched again on every app load.
    me: CurrentUser | null;
    meStatus: MeStatus;
    meError: string | null;
}

const initialState: AuthState = {
    token: localStorage.getItem("token"),
    email: localStorage.getItem("email"),
    loading: false,
    error: null,
    me: null,
    meStatus: "idle",
    meError: null,
}

export const fetchMeThunk = createAsyncThunk<CurrentUser, void, { rejectValue: string }>(
    "auth/me",
    async (_, { rejectWithValue }) => {
        try {
            return await getMeApi();
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error, "No se pudo cargar tu sesión"));
        }
    },
    // The layout and each guarded route ask for it on the same render; one request is enough.
    { condition: (_, { getState }) => (getState() as { auth: AuthState }).auth.meStatus !== "loading" }
);

export const loginThunk = createAsyncThunk<
  string,                // return type
  LoginRequest,          // argument type
  { rejectValue: string } // reject type
>(
    "auth/login"
    ,async (
        { email, password }: LoginRequest,
        { rejectWithValue }
    ) => {
        try {
            const data = await postLogin(email,password);
            return data.token;
        } catch (error) {
            if(axios.isAxiosError(error)){
                return rejectWithValue(
                    error.response?.data?.message || "Something went wrong"
                )
            }else{
                return rejectWithValue(
                    "Something went wrong"
                )
            }
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{
        logout: (state) => {
            state.token = null;
            state.email = null;
            state.me = null;
            state.meStatus = "idle";
            state.meError = null;
            localStorage.removeItem("token");
            localStorage.removeItem("email");
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload;
                state.email = action.meta.arg.email;
                // a new token may carry another role: load /auth/me again
                state.me = null;
                state.meStatus = "idle";
                localStorage.setItem("token",action.payload);
                localStorage.setItem("email",action.meta.arg.email);
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchMeThunk.pending, (state) => {
                state.meStatus = "loading";
                state.meError = null;
            })
            .addCase(fetchMeThunk.fulfilled, (state, action) => {
                state.meStatus = "ready";
                state.me = action.payload;
            })
            .addCase(fetchMeThunk.rejected, (state, action) => {
                state.meStatus = "error";
                state.meError = action.payload ?? "No se pudo cargar tu sesión";
            });
    }
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;