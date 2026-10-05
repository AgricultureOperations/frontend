import { describe, expect, test } from "vitest";
import { authReducer, fetchMeThunk, logout } from "../../../src/features/auth/states/auth.slice";

const me = { id: "u1", name: "Ana", permissions: ["users:view"] };

describe("authReducer: /auth/me", () => {
    test("goes idle → loading → ready and stores the user", () => {
        let state = authReducer(undefined, { type: "init" });
        expect(state.meStatus).toBe("idle");
        state = authReducer(state, { type: fetchMeThunk.pending.type });
        expect(state.meStatus).toBe("loading");
        state = authReducer(state, { type: fetchMeThunk.fulfilled.type, payload: me });
        expect(state).toMatchObject({ meStatus: "ready", me });
    });

    test("keeps the error message on failure", () => {
        const state = authReducer(undefined, { type: fetchMeThunk.rejected.type, payload: "auth-service down" });
        expect(state).toMatchObject({ meStatus: "error", meError: "auth-service down", me: null });
    });

    test("logout clears the user so the next session loads its own permissions", () => {
        const loaded = authReducer(undefined, { type: fetchMeThunk.fulfilled.type, payload: me });
        expect(authReducer(loaded, logout())).toMatchObject({ me: null, meStatus: "idle" });
    });
});
