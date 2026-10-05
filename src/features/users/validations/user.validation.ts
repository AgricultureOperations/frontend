import * as yup from "yup";

// UX-only mirror of auth-service's rules (user.controller.ts + seed.ts MIN_PASSWORD_LENGTH). The backend checks them again.
export const MIN_PASSWORD_LENGTH = 8;

const name = yup.string().trim().required("El nombre es obligatorio").max(120, "Máximo 120 caracteres");
const roleId = yup.string().required("Seleccione un rol");

export const createUserSchema = yup.object().shape({
    name,
    email: yup.string().trim().required("El correo es obligatorio").email("Ingrese un correo válido").max(255, "Máximo 255 caracteres"),
    password: yup
        .string()
        .required("La contraseña es obligatoria")
        .min(MIN_PASSWORD_LENGTH, `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`)
        .max(128, "Máximo 128 caracteres"),
    roleId,
});

// Editing: the email is read-only and the password isn't changed here.
export const editUserSchema = yup.object().shape({ name, roleId });
