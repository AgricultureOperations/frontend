import { describe, expect, test } from "vitest";
import { Role } from "../../../src/features/roles/interfaces/role.interface";
import {
    createRoleThunk,
    deleteRoleThunk,
    fetchRolesPageThunk,
    initialRoleState,
    roleReducer,
    setRolePermissionsThunk,
    updateRoleThunk,
} from "../../../src/features/roles/states/role.slice";

const role = (id: string, permissionIds: string[] = []) => ({ id, key: id, name: id, permissionIds }) as unknown as Role;
const matrix = { actions: [], resources: [] };

describe("roleReducer", () => {
    test("loads roles and the matrix together", () => {
        let state = roleReducer(initialRoleState, { type: fetchRolesPageThunk.pending.type });
        expect(state.loading).toBe(true);
        state = roleReducer(state, { type: fetchRolesPageThunk.fulfilled.type, payload: { roles: [role("admin")], matrix } });
        expect(state).toMatchObject({ loading: false, matrix });
        expect(state.roles).toHaveLength(1);
    });

    test("keeps the rejection message", () => {
        const state = roleReducer(initialRoleState, { type: fetchRolesPageThunk.rejected.type, payload: "down" });
        expect(state).toMatchObject({ loading: false, error: "down" });
    });

    test("adds, replaces and removes roles; every mutation toggles saving", () => {
        let state = roleReducer({ ...initialRoleState, roles: [role("admin")] }, { type: createRoleThunk.fulfilled.type, payload: role("editor") });
        expect(state.roles.map((r) => r.id)).toEqual(["admin", "editor"]);
        state = roleReducer(state, { type: setRolePermissionsThunk.fulfilled.type, payload: role("editor", ["p1"]) });
        expect(state.roles[1].permissionIds).toEqual(["p1"]);
        state = roleReducer(state, { type: deleteRoleThunk.fulfilled.type, payload: "editor" });
        expect(state.roles.map((r) => r.id)).toEqual(["admin"]);

        for (const thunk of [createRoleThunk, updateRoleThunk, setRolePermissionsThunk, deleteRoleThunk]) {
            const pending = roleReducer(initialRoleState, { type: thunk.pending.type });
            expect(pending.saving).toBe(true);
            expect(roleReducer(pending, { type: thunk.rejected.type, payload: "x" }).saving).toBe(false);
        }
    });
});
