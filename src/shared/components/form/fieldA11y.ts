import styles from "../../../styles/shared/components/form/Form.module.scss";

// Props for a control inside FormField: id/name, error wiring and the shared control class.
export const fieldA11y = (id: string, error?: string, required = false) => ({
    id,
    name: id,
    "aria-required": required || undefined,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    className: `${styles.control} ${error ? styles.controlInvalid : ""}`,
});
