import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LoginRequest } from '../interfaces/login.request';
import { postLogin } from '../apis/post-login.action';
import axios from "axios";

interface AuthState {
    token: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    token: localStorage.getItem("token"),
    loading: false,
    error: null
}

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
            localStorage.removeItem("token")
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
                localStorage.setItem("token",action.payload);
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;