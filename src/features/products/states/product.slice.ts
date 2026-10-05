import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected } from "@reduxjs/toolkit";
import { getProductsApi } from "../apis/get-products.api";
import { createProductApi } from "../apis/create-product.api";
import { updateProductApi } from "../apis/update-product.api";
import { deleteProductApi } from "../apis/delete-product.api";
import { Product } from "../interfaces/product.interface";
import { PaginationMeta, ProductListQuery, ProductListResponse } from "../interfaces/product-list.interface";
import { CreateProductRequest, UpdateProductRequest } from "../interfaces/product.request";
import { getApiErrorMessage } from "../../../shared/utils/apiError";

export const PRODUCTS_PAGE_SIZE = 10;

interface ProductState {
    products: Product[];
    meta: PaginationMeta;
    loading: boolean;
    // true while a create, update or delete is in flight
    saving: boolean;
    error: string | null;
}

export const initialProductState: ProductState = {
    products: [],
    meta: { page: 1, limit: PRODUCTS_PAGE_SIZE, total: 0, totalPages: 0 },
    loading: false,
    saving: false,
    error: null,
};

// 403 (RBAC Phase 2) becomes the shared "no permission" message; the page shows it as a toast.
const toMessage = (error: unknown): string => getApiErrorMessage(error);

export const fetchProductsThunk = createAsyncThunk<ProductListResponse, ProductListQuery, { rejectValue: string }>(
    "api/products/list",
    async (query, { rejectWithValue }) => {
        try {
            return await getProductsApi(query);
        } catch (error) {
            return rejectWithValue(toMessage(error));
        }
    }
);

export const createProductThunk = createAsyncThunk<Product, CreateProductRequest, { rejectValue: string }>(
    "api/products/create",
    async (body, { rejectWithValue }) => {
        try {
            return await createProductApi(body);
        } catch (error) {
            return rejectWithValue(toMessage(error));
        }
    }
);

export const updateProductThunk = createAsyncThunk<
    Product,
    { id: string; changes: UpdateProductRequest },
    { rejectValue: string }
>("api/products/update", async ({ id, changes }, { rejectWithValue }) => {
    try {
        return await updateProductApi(id, changes);
    } catch (error) {
        return rejectWithValue(toMessage(error));
    }
});

export const deleteProductThunk = createAsyncThunk<string, string, { rejectValue: string }>(
    "api/products/delete",
    async (id, { rejectWithValue }) => {
        try {
            await deleteProductApi(id);
            return id;
        } catch (error) {
            return rejectWithValue(toMessage(error));
        }
    }
);

const productSlice = createSlice({
    name: "products",
    initialState: initialProductState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProductsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(fetchProductsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Something went wrong";
            })
            .addCase(updateProductThunk.fulfilled, (state, action) => {
                state.products = state.products.map((p) => (p.id === action.payload.id ? action.payload : p));
            })
            .addCase(deleteProductThunk.fulfilled, (state, action) => {
                state.products = state.products.filter((p) => p.id !== action.payload);
            });

        // create/update/delete share the saving flag; the page re-fetches the list after each one
        const mutations = [createProductThunk, updateProductThunk, deleteProductThunk] as const;
        builder
            .addMatcher(isPending(...mutations), (state) => {
                state.saving = true;
            })
            .addMatcher(isFulfilled(...mutations), (state) => {
                state.saving = false;
            })
            .addMatcher(isRejected(...mutations), (state) => {
                state.saving = false;
            });
    },
});

export const productReducer = productSlice.reducer;
