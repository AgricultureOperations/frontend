import { describe, expect, test } from "vitest";
import { createUserSchema, editUserSchema } from "../../../src/features/users/validations/user.validation";

const valid = { name: "Ana Pérez", email: "ana@agriops.io", password: "secret123", roleId: "r1" };

const errorsOf = (values: object) => {
    try {
        createUserSchema.validateSync(values, { abortEarly: false });
        return {};
    } catch (error) {
        // First message per field, like useUserForm shows it.
        const errors: Record<string, string> = {};
        (error as { inner: { path: string; message: string }[] }).inner.forEach((e) => (errors[e.path] ??= e.message));
        return errors;
    }
};

describe("user form validation", () => {
    test("accepts a complete new user", () => {
        expect(createUserSchema.isValidSync(valid)).toBe(true);
    });

    test("requires every field and a real email", () => {
        expect(errorsOf({ name: " ", email: "nope", password: "", roleId: "" })).toEqual({
            name: "El nombre es obligatorio",
            email: "Ingrese un correo válido",
            password: "La contraseña es obligatoria",
            roleId: "Seleccione un rol",
        });
    });

    test("mirrors auth-service's 8-character password minimum", () => {
        expect(errorsOf({ ...valid, password: "1234567" }).password).toBe("Mínimo 8 caracteres");
    });

    test("editing only needs a name and a role", () => {
        expect(editUserSchema.isValidSync({ name: "Ana", roleId: "r1" })).toBe(true);
        expect(editUserSchema.isValidSync({ name: "", roleId: "r1" })).toBe(false);
    });
});
