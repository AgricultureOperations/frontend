import { describe, expect, test } from "vitest";
import { validateRoleCreate } from "../../../src/features/roles/hooks/useManageRoles";
import { deleteBlockedReason, formatRoleOption, isValidRoleKey, slugifyRoleKey } from "../../../src/features/roles/utils/role-key";

describe("role identifier", () => {
    test("slugifies like auth-service (accents dropped, snake_case)", () => {
        expect(slugifyRoleKey("Coordinador de Admisión")).toBe("coordinador_de_admision");
        expect(slugifyRoleKey("  Supervisor   de campo! ")).toBe("supervisor_de_campo");
        expect(slugifyRoleKey("x".repeat(80))).toHaveLength(50);
    });

    test("validates the backend's key pattern", () => {
        expect(isValidRoleKey("field_supervisor")).toBe(true);
        expect(isValidRoleKey("a")).toBe(false);
        expect(isValidRoleKey("1role")).toBe(false);
        expect(isValidRoleKey("with-hyphen")).toBe(false);
        expect(isValidRoleKey("Upper")).toBe(false);
    });

    test("formats options as 'Name (key)'", () => {
        expect(formatRoleOption({ name: "Operator", key: "operator" })).toBe("Operator (operator)");
    });

    test("explains why a role can't be deleted", () => {
        expect(deleteBlockedReason({ isSystem: true, userCount: 0 })).toMatch(/sistema/);
        expect(deleteBlockedReason({ isSystem: false, userCount: 2 })).toMatch(/Reasigna/);
        expect(deleteBlockedReason({ isSystem: false, userCount: 0 })).toBeNull();
    });
});

describe("validateRoleCreate", () => {
    test("requires a name and a valid key", () => {
        expect(validateRoleCreate({ name: "", key: "", description: "" })).toEqual({
            name: "El nombre es obligatorio",
            key: "El identificador es obligatorio",
        });
        expect(validateRoleCreate({ name: "Ok", key: "bad-key", description: "" }).key).toBeDefined();
        expect(validateRoleCreate({ name: "Supervisor", key: "supervisor", description: "" })).toEqual({});
    });

    test("enforces the backend's length limits", () => {
        const errors = validateRoleCreate({ name: "n".repeat(81), key: "ok_key", description: "d".repeat(256) });
        expect(errors).toMatchObject({ name: "Máximo 80 caracteres", description: "Máximo 255 caracteres" });
    });
});
