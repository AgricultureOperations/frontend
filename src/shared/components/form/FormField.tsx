import type { ReactNode } from "react";
import styles from "../../../styles/shared/components/form/Form.module.scss";

interface Props {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    fullWidth?: boolean;
    children: ReactNode;
}

// Label + control + hint/error. The control must use `id` and set aria-invalid / aria-describedby itself.
export const FormField = ({ id, label, required = false, error, hint, fullWidth = false, children }: Props) => (
    <div className={`${styles.field} ${fullWidth ? styles.fullWidth : ""}`}>
        {/* The asterisk sits outside <label> so it doesn't become part of the accessible name. */}
        <div className={styles.labelRow}>
            <label htmlFor={id} className={styles.label}>{label}</label>
            {required && <span className={styles.required} aria-hidden>*</span>}
        </div>
        {children}
        {error ? (
            <span id={`${id}-error`} className={styles.error}>{error}</span>
        ) : (
            hint && <span id={`${id}-hint`} className={styles.hint}>{hint}</span>
        )}
    </div>
);
