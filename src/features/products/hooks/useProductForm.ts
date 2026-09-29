import { FormEvent, useState } from "react";
import { ValidationError } from "yup";
import { ProductFormErrors, ProductFormValues } from "../interfaces/product-form.interface";
import { CreateProductRequest } from "../interfaces/product.request";
import { formValuesToRequest } from "../utils/product-form.mapper";
import { productSchema } from "../validations/product.validation";

// Local form state + Yup validation for the product modal. Never stored in Redux.
export const useProductForm = (
    initialValues: ProductFormValues,
    onSubmit: (body: CreateProductRequest) => Promise<string | null>,
) => {
    const [values, setValues] = useState<ProductFormValues>(initialValues);
    const [errors, setErrors] = useState<ProductFormErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    const setField = <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
    };

    const handleSubmit = async (event?: FormEvent) => {
        event?.preventDefault();
        setSubmitError(null);
        try {
            await productSchema.validate(values, { abortEarly: false });
        } catch (error) {
            if (error instanceof ValidationError) {
                const next: ProductFormErrors = {};
                error.inner.forEach((e) => {
                    const path = e.path as keyof ProductFormValues | undefined;
                    if (path && !next[path]) next[path] = e.message;
                });
                setErrors(next);
            }
            return;
        }
        setErrors({});
        setSubmitError(await onSubmit(formValuesToRequest(values)));
    };

    return { values, errors, submitError, setField, handleSubmit };
};
