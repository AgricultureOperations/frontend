import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, test } from "vitest";
import { FORBIDDEN_MESSAGE, getApiErrorMessage } from "../../src/shared/utils/apiError";

const axiosError = (status: number, data: unknown) =>
    new AxiosError("fail", "ERR", undefined, undefined, {
        status,
        data,
        statusText: "",
        headers: {},
        config: { headers: new AxiosHeaders() },
    });

describe("getApiErrorMessage", () => {
    test("maps 403 to the no-permission message instead of the backend's English text", () => {
        expect(getApiErrorMessage(axiosError(403, { message: "You don't have permission to do this" }))).toBe(FORBIDDEN_MESSAGE);
    });

    test("uses the backend message for other statuses (e.g. a 409 guardrail)", () => {
        expect(getApiErrorMessage(axiosError(409, { message: "Cannot delete the last active admin" }))).toBe(
            "Cannot delete the last active admin",
        );
    });

    test("falls back when there is no message", () => {
        expect(getApiErrorMessage(axiosError(500, ""), "fallback")).toBe("fallback");
        expect(getApiErrorMessage(new Error("boom"))).toBe("boom");
        expect(getApiErrorMessage("??", "fallback")).toBe("fallback");
    });
});
