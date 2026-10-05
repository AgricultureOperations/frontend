import { afterEach, describe, expect, test, vi } from "vitest";
import { bitacoraApi } from "../../../src/api/bitacora.api";
import { getUsersApi } from "../../../src/features/users/apis/get-users.api";

const query = { page: 1, pageSize: 10 };

describe("getUsersApi", () => {
    afterEach(() => vi.restoreAllMocks());

    test("calls /api/v1/user (not /user) with the filters and returns the page", async () => {
        const body = { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } };
        const get = vi.spyOn(bitacoraApi, "get").mockResolvedValue({ data: body });
        await expect(getUsersApi({ ...query, search: "ana", isActive: true })).resolves.toEqual(body);
        expect(get).toHaveBeenCalledWith("/api/v1/user", { params: { ...query, search: "ana", isActive: true } });
    });

    test("rejects an HTML page (missing VITE_BITACORA_BASE_URL) instead of passing undefined to the page", async () => {
        vi.spyOn(bitacoraApi, "get").mockResolvedValue({ data: "<!doctype html>" });
        await expect(getUsersApi(query)).rejects.toThrow("VITE_BITACORA_BASE_URL");
    });
});
