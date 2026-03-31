import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Order } from "../interfaces/order.interface";
import axios from "axios";
import { orderApi } from "../../../api/order.api";

interface OrderState {
    orders: Order[];
    loading: boolean;
    error: string | null;
}

const initialState: OrderState = {
    orders: [],
    loading: false,
    error: null
}

export const orderThunk = createAsyncThunk<
Order[],
void,
{ rejectValue: string }
>(
    "api/orders"
    ,async (_: void,{ rejectWithValue }) => {
        try{
            const data = await orderApi.get("api/orders");
            return data.data;
        }catch(error){
            if(axios.isAxiosError(error)){
                return rejectWithValue(
                    error.response?.data.message || "Something went wrong"
                )
            }else {
                return rejectWithValue(
                    "Something went wrong"
                )
            }
        }
    }
);

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers:{},
    extraReducers: (builder) => {
        builder
        .addCase(orderThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(orderThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.orders = action.payload;
        })
        .addCase(orderThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
    }
})

export const orderReducer = orderSlice.reducer;