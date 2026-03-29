import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RegisterRequest } from "../interfaces/register.request";
import { postRegister } from "../apis/post-register.action";

interface RegisterState {
    success: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: RegisterState = {
    success: false,
    loading: false,
    error: null
}

export const registerThunk = createAsyncThunk<
    void,
    RegisterRequest,
    { rejectValue: string }
>(
    "auth/register"
    ,async (
        { email, password }: RegisterRequest,
        { rejectWithValue }
    ) =>{
        try {
            await postRegister(email,password);
        } catch (error) {
            if(axios.isAxiosError(error)){
                return rejectWithValue(
                    error.response?.data?.message || "Something went wrong"
                );
            }else{
                return rejectWithValue(
                    "Something went wrong"
                );
            }
        }
    }
);

const registerSlice = createSlice({
    name: "register",
    initialState,
    reducers:{},
    extraReducers: (builder) => {
        builder
            .addCase(registerThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(registerThunk.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload as string;
            });
    }
});

export const registerReducer = registerSlice.reducer;