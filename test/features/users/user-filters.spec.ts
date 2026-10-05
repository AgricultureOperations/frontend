import { describe, expect, test } from "vitest";
import { User } from "../../../src/features/users/interfaces/user.interface";
import { deriveRoleOptions, formatRoleLabel, parseUserFilters, toUserListQuery } from "../../../src/features/users/utils/user-filters";

describe("user filters", () => {
    test("parses the URL with defaults for missing or invalid values", () => {
        expect(parseUserFilters(new URLSearchParams(""))).toEqual({ search: "", status: "all", roleId: "", page: 1, pageSize: 10 });
        expect(parseUserFilters(new URLSearchParams("q= ana &status=inactive&role=r1&page=3&size=20"))).toEqual({
            search: "ana",
            status: "inactive",
            roleId: "r1",
            page: 3,
            pageSize: 20,
        });
        expect(parseUserFilters(new URLSearchParams("status=weird&page=-2&size=7"))).toMatchObject({ status: "all", page: 1, pageSize: 10 });
    });

    test("maps filters to GET /user params, leaving empty ones out", () => {
        expect(toUserListQuery({ search: "", status: "all", roleId: "", page: 1, pageSize: 10 })).toEqual({ page: 1, pageSize: 10 });
        expect(toUserListQuery({ search: "ana", status: "active", roleId: "r1", page: 2, pageSize: 5 })).toEqual({
            page: 2,
            pageSize: 5,
            search: "ana",
            roleId: "r1",
            isActive: true,
        });
        expect(toUserListQuery({ search: "", status: "inactive", roleId: "", page: 1, pageSize: 10 }).isActive).toBe(false);
    });

    test("derives unique, sorted role options from the loaded users", () => {
        const users = [
            { role: { id: "2", key: "viewer", name: "Viewer" } },
            { role: { id: "1", key: "admin", name: "Administrator" } },
            { role: { id: "2", key: "viewer", name: "Viewer" } },
        ] as User[];
        expect(deriveRoleOptions(users).map((r) => r.key)).toEqual(["admin", "viewer"]);
    });

    test("labels roles as 'Name (key)'", () => {
        expect(formatRoleLabel({ name: "Viewer", key: "viewer" })).toBe("Viewer (viewer)");
    });
});
