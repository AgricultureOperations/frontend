import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "../../../shared/utils/apiError";
import { createUserApi } from "../apis/create-user.api";
import { deleteUserApi } from "../apis/delete-user.api";
import { getRoleOptionsApi } from "../apis/get-role-options.api";
import { getUsersApi } from "../apis/get-users.api";
import { updateUserRoleApi } from "../apis/update-user-role.api";
import { updateUserStatusApi } from "../apis/update-user-status.api";
import { updateUserApi } from "../apis/update-user.api";
import { UserListMeta, UserListQuery, UserListResponse } from "../interfaces/user-list.interface";
import { RoleOption, User, UserRoleRef } from "../interfaces/user.interface";
import { CreateUserRequest, UpdateUserRequest } from "../interfaces/user.request";

export const USERS_PAGE_SIZES = [5, 10, 20, 50];
export const USERS_DEFAULT_PAGE_SIZE = 10;

interface UserState {
    users: User[];
    meta: UserListMeta;
    loading: boolean;
    // true while a create, update, status change or delete is in flight
    saving: boolean;
    error: string | null;
    // Options for the role selects (GET /roles). Empty when the user lacks roles:view.
    roleOptions: RoleOption[];
    // Users whose inline role change is in flight (their select is disabled meanwhile).
    roleChangePending: string[];
}

export const initialUserState: UserState = {
    users: [],
    meta: { page: 1, pageSize: USERS_DEFAULT_PAGE_SIZE, total: 0, totalPages: 0 },
    loading: false,
    saving: false,
    error: null,
    roleOptions: [],
    roleChangePending: [],
};

export const fetchUsersThunk = createAsyncThunk<UserListResponse, UserListQuery, { rejectValue: string }>(
    "api/users/list",
    async (query, { rejectWithValue }) => {
        try {
            return await getUsersApi(query);
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const fetchRoleOptionsThunk = createAsyncThunk<RoleOption[], void, { rejectValue: string }>(
    "api/users/roleOptions",
    async (_, { rejectWithValue }) => {
        try {
            return await getRoleOptionsApi();
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const createUserThunk = createAsyncThunk<User, CreateUserRequest, { rejectValue: string }>(
    "api/users/create",
    async (body, { rejectWithValue }) => {
        try {
            return await createUserApi(body);
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const updateUserThunk = createAsyncThunk<User, { id: string; changes: UpdateUserRequest }, { rejectValue: string }>(
    "api/users/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            return await updateUserApi(id, changes);
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

// `role` is applied optimistically on pending and `previous` restored on rejection (e.g. 409 last admin).
export const updateUserRoleThunk = createAsyncThunk<
    User,
    { id: string; role: UserRoleRef; previous: UserRoleRef },
    { rejectValue: string }
>("api/users/role", async ({ id, role }, { rejectWithValue }) => {
    try {
        return await updateUserRoleApi(id, role.id);
    } catch (error) {
        return rejectWithValue(getApiErrorMessage(error));
    }
});

export const updateUserStatusThunk = createAsyncThunk<User, { id: string; isActive: boolean }, { rejectValue: string }>(
    "api/users/status",
    async ({ id, isActive }, { rejectWithValue }) => {
        try {
            return await updateUserStatusApi(id, isActive);
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const deleteUserThunk = createAsyncThunk<string, string, { rejectValue: string }>(
    "api/users/delete",
    async (id, { rejectWithValue }) => {
        try {
            await deleteUserApi(id);
            return id;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

const replaceUser = (users: User[], next: User) => users.map((u) => (u.id === next.id ? next : u));

const userSlice = createSlice({
    name: "users",
    initialState: initialUserState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsersThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsersThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(fetchUsersThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Something went wrong";
            })
            .addCase(fetchRoleOptionsThunk.fulfilled, (state, action) => {
                state.roleOptions = action.payload;
            })
            .addCase(updateUserThunk.fulfilled, (state, action) => {
                state.users = replaceUser(state.users, action.payload);
            })
            .addCase(updateUserStatusThunk.fulfilled, (state, action) => {
                state.users = replaceUser(state.users, action.payload);
            })
            .addCase(deleteUserThunk.fulfilled, (state, action) => {
                state.users = state.users.filter((u) => u.id !== action.payload);
            })
            .addCase(updateUserRoleThunk.pending, (state, action) => {
                const { id, role } = action.meta.arg;
                state.roleChangePending.push(id);
                state.users = state.users.map((u) => (u.id === id ? { ...u, role } : u));
            })
            .addCase(updateUserRoleThunk.fulfilled, (state, action) => {
                state.roleChangePending = state.roleChangePending.filter((id) => id !== action.meta.arg.id);
                state.users = replaceUser(state.users, action.payload);
            })
            .addCase(updateUserRoleThunk.rejected, (state, action) => {
                const { id, previous } = action.meta.arg;
                state.roleChangePending = state.roleChangePending.filter((pending) => pending !== id);
                state.users = state.users.map((u) => (u.id === id ? { ...u, role: previous } : u));
            });

        // create/update/status/delete share the saving flag; the page re-fetches the list after create and delete
        const mutations = [createUserThunk, updateUserThunk, updateUserStatusThunk, deleteUserThunk] as const;
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

export const userReducer = userSlice.reducer;
