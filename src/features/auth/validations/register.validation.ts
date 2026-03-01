import * as yup from 'yup';
export const registerSchema = yup.object({
    email: yup
        .string()
        .required("Email is required")
        .email("Email must be valid"),
    password: yup
        .string()
        .required("Password is required")
        .min(8,"Password must be at least 8 characters")
        .matches(/[A-Z]/,"Password must contain at leat one uppercase letter")
});