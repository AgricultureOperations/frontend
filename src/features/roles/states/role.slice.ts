import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "../../../shared/utils/apiError";
import { createRoleApi } from "../apis/create-role.api";
import { deleteRoleApi } from "../apis/delete-role.api";
import { getPermissionMatrixApi } from "../apis/get-permission-matrix.api";
import { getRolesApi } from "../apis/get-roles.api";
import { setRolePermissionsApi } from "../apis/set-role-permissions.api";
import { updateRoleApi } from "../apis/update-role.api";
import { PermissionMatrix } from "../interfaces/permission.interface";
import { Role } from "../interfaces/role.interface";
import { CreateRoleRequest, UpdateRoleRequest } from "../interfaces/role.request";

interface RoleState {
    roles: Role[];
    matrix: PermissionMatrix | null;
    // true while the roles list or the permission matrix loads
    loading: boolean;
    // true while a create, update, permission save or delete is in flight
    saving: boolean;
    error: string | null;
}

export const initialRoleState: RoleState = {
    roles: [],
    matrix: null,
    loading: false,
    saving: false,
    error: null,
};

// Roles and the matrix always load together: the matrix screen needs both.
export const fetchRolesPageThunk = createAsyncThunk<{ roles: Role[]; matrix: PermissionMatrix }, void, { rejectValue: string }>(
    "api/roles/load",
    async (_, { rejectWithValue }) => {
        try {
            const [roles, matrix] = await Promise.all([getRolesApi(), getPermissionMatrixApi()]);
            return { roles, matrix };
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const createRoleThunk = createAsyncThunk<Role, CreateRoleRequest, { rejectValue: string }>(
    "api/roles/create",
    async (body, { rejectWithValue }) => {
        try {
            return await createRoleApi(body);
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const updateRoleThunk = createAsyncThunk<Role, { id: string; changes: UpdateRoleRequest }, { rejectValue: string }>(
    "api/roles/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            return await updateRoleApi(id, changes);
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const setRolePermissionsThunk = createAsyncThunk<Role, { id: string; permissionIds: string[] }, { rejectValue: string }>(
    "api/roles/permissions",
    async ({ id, permissionIds }, { rejectWithValue }) => {
        try {
            return await setRolePermissionsApi(id, permissionIds);
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const deleteRoleThunk = createAsyncThunk<string, string, { rejectValue: string }>(
    "api/roles/delete",
    async (id, { rejectWithValue }) => {
        try {
            await deleteRoleApi(id);
            return id;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

const replaceRole = (roles: Role[], next: Role) => roles.map((r) => (r.id === next.id ? next : r));

const roleSlice = createSlice({
    name: "roles",
    initialState: initialRoleState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRolesPageThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRolesPageThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = action.payload.roles;
                state.matrix = action.payload.matrix;
            })
            .addCase(fetchRolesPageThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Something went wrong";
            })
            .addCase(createRoleThunk.fulfilled, (state, action) => {
                state.roles.push(action.payload);
            })
            .addCase(updateRoleThunk.fulfilled, (state, action) => {
                state.roles = replaceRole(state.roles, action.payload);
            })
            .addCase(setRolePermissionsThunk.fulfilled, (state, action) => {
                state.roles = replaceRole(state.roles, action.payload);
            })
            .addCase(deleteRoleThunk.fulfilled, (state, action) => {
                state.roles = state.roles.filter((r) => r.id !== action.payload);
            });

        const mutations = [createRoleThunk, updateRoleThunk, setRolePermissionsThunk, deleteRoleThunk] as const;
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

export const roleReducer = roleSlice.reducer;
