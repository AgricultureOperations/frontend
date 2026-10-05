import { configureStore } from "@reduxjs/toolkit";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { describe, expect, test } from "vitest";
import { authReducer, fetchMeThunk } from "../../src/features/auth/states/auth.slice";
import { CurrentUser } from "../../src/features/auth/interfaces/me.response";
import { Can } from "../../src/shared/components/Can";
import { hasPermission, toPermissionCode } from "../../src/shared/utils/permissions";

const me = (permissions: string[]) =>
    ({ id: "u1", name: "Ana", email: "ana@agriops.io", role: { id: "r1", key: "operator", name: "Operator" }, permissions }) as CurrentUser;

const storeWith = (permissions: string[] | null) => {
    const store = configureStore({ reducer: { auth: authReducer } });
    if (permissions) store.dispatch({ type: fetchMeThunk.fulfilled.type, payload: me(permissions) });
    return store;
};

const render = (permissions: string[] | null, permission: string) =>
    renderToStaticMarkup(
        <Provider store={storeWith(permissions)}>
            <Can permission={permission} fallback={<i>no</i>}>
                <b>yes</b>
            </Can>
        </Provider>,
    );

describe("permission helpers", () => {
    test("builds resource:action codes", () => {
        expect(toPermissionCode("users", "edit")).toBe("users:edit");
    });

    test("hasPermission matches exact codes only", () => {
        expect(hasPermission(["users:view", "users:edit"], "users:edit")).toBe(true);
        expect(hasPermission(["users:view"], "users:edit")).toBe(false);
        expect(hasPermission(["users:editor"], "users:edit")).toBe(false);
        expect(hasPermission(undefined, "users:view")).toBe(false);
    });
});

describe("<Can>", () => {
    test("renders children when /auth/me grants the permission", () => {
        expect(render(["users:view", "users:edit"], "users:edit")).toBe("<b>yes</b>");
    });

    test("renders the fallback without the permission", () => {
        expect(render(["users:view"], "users:delete")).toBe("<i>no</i>");
    });

    test("renders the fallback while /auth/me hasn't loaded", () => {
        expect(render(null, "users:view")).toBe("<i>no</i>");
    });
});
