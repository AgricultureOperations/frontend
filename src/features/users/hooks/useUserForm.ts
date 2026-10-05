import { FormEvent, useMemo, useState } from "react";
import { ValidationError } from "yup";
import { UserFormErrors, UserFormValues } from "../interfaces/user-form.interface";
import { createUserSchema, editUserSchema } from "../validations/user.validation";

// Local form state + Yup validation for the user drawer. Never stored in Redux.
export const useUserForm = (
    mode: "create" | "edit",
    initialValues: UserFormValues,
    onSubmit: (values: UserFormValues) => Promise<string | null>,
) => {
    const schema = mode === "create" ? createUserSchema : editUserSchema;
    const [values, setValues] = useState<UserFormValues>(initialValues);
    const [errors, setErrors] = useState<UserFormErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof UserFormValues, boolean>>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    // The reference keeps the submit button disabled until the form is valid.
    const isValid = useMemo(() => schema.isValidSync(values), [schema, values]);

    const validateField = (field: keyof UserFormValues, next: UserFormValues) => {
        if (!(field in schema.fields)) return;
        try {
            schema.validateSyncAt(field, next);
            setErrors((current) => ({ ...current, [field]: undefined }));
        } catch (error) {
            if (error instanceof ValidationError) setErrors((current) => ({ ...current, [field]: error.message }));
        }
    };

    const setField = (field: keyof UserFormValues, value: string) => {
        const next = { ...values, [field]: value };
        setValues(next);
        // Re-check as the user types only once the field has been left, so errors don't flash on the first key.
        if (touched[field]) validateField(field, next);
    };

    const blurField = (field: keyof UserFormValues) => {
        setTouched((current) => ({ ...current, [field]: true }));
        validateField(field, values);
    };

    const handleSubmit = async (event?: FormEvent) => {
        event?.preventDefault();
        setSubmitError(null);
        try {
            await schema.validate(values, { abortEarly: false });
        } catch (error) {
            if (error instanceof ValidationError) {
                const next: UserFormErrors = {};
                error.inner.forEach((e) => {
                    const path = e.path as keyof UserFormValues | undefined;
                    if (path && !next[path]) next[path] = e.message;
                });
                setErrors(next);
            }
            return;
        }
        setErrors({});
        setSubmitError(await onSubmit({ ...values, name: values.name.trim(), email: values.email.trim().toLowerCase() }));
    };

    return { values, errors, submitError, isValid, setField, blurField, handleSubmit };
};
