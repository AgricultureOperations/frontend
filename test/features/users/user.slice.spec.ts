import { describe, expect, test } from "vitest";
import { User } from "../../../src/features/users/interfaces/user.interface";
import {
    createUserThunk,
    deleteUserThunk,
    fetchUsersThunk,
    initialUserState,
    updateUserRoleThunk,
    updateUserStatusThunk,
    updateUserThunk,
    userReducer,
} from "../../../src/features/users/states/user.slice";

const viewer = { id: "r-viewer", key: "viewer", name: "Viewer" };
const admin = { id: "r-admin", key: "admin", name: "Administrator" };
const user = (id: string, role = viewer) => ({ id, name: id, email: `${id}@agriops.io`, isActive: true, role }) as User;
const meta = { page: 1, pageSize: 10, total: 2, totalPages: 1 };
const roleArg = { id: "a", role: admin, previous: viewer };

describe("userReducer", () => {
    test("stores the fetched page", () => {
        const state = userReducer(initialUserState, { type: fetchUsersThunk.fulfilled.type, payload: { data: [user("a"), user("b")], meta } });
        expect(state).toMatchObject({ loading: false, meta });
        expect(state.users.map((u) => u.id)).toEqual(["a", "b"]);
    });

    test("applies a role change optimistically and disables that row's select", () => {
        const loaded = { ...initialUserState, users: [user("a"), user("b")] };
        const pending = userReducer(loaded, { type: updateUserRoleThunk.pending.type, meta: { arg: roleArg } });
        expect(pending.users[0].role).toEqual(admin);
        expect(pending.roleChangePending).toEqual(["a"]);

        const done = userReducer(pending, { type: updateUserRoleThunk.fulfilled.type, payload: user("a", admin), meta: { arg: roleArg } });
        expect(done.users[0].role).toEqual(admin);
        expect(done.roleChangePending).toEqual([]);
    });

    test("reverts the role when the server refuses it (e.g. 409 last admin)", () => {
        const loaded = { ...initialUserState, users: [user("a")] };
        const pending = userReducer(loaded, { type: updateUserRoleThunk.pending.type, meta: { arg: roleArg } });
        const rejected = userReducer(pending, { type: updateUserRoleThunk.rejected.type, payload: "Cannot demote", meta: { arg: roleArg } });
        expect(rejected.users[0].role).toEqual(viewer);
        expect(rejected.roleChangePending).toEqual([]);
    });

    test("replaces updated users, removes deleted ones and tracks saving", () => {
        const loaded = { ...initialUserState, users: [user("a"), user("b")] };
        const renamed = userReducer(loaded, { type: updateUserThunk.fulfilled.type, payload: { ...user("b"), name: "Bea" } });
        expect(renamed.users[1].name).toBe("Bea");
        const disabled = userReducer(renamed, { type: updateUserStatusThunk.fulfilled.type, payload: { ...user("a"), isActive: false } });
        expect(disabled.users[0].isActive).toBe(false);
        expect(userReducer(disabled, { type: deleteUserThunk.fulfilled.type, payload: "a" }).users.map((u) => u.id)).toEqual(["b"]);

        for (const thunk of [createUserThunk, updateUserThunk, updateUserStatusThunk, deleteUserThunk]) {
            const pending = userReducer(initialUserState, { type: thunk.pending.type });
            expect(pending.saving).toBe(true);
            expect(userReducer(pending, { type: thunk.rejected.type, payload: "x" }).saving).toBe(false);
        }
    });
});
