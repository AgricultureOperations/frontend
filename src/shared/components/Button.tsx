import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "../../styles/shared/components/Button.module.scss";

type Variant = "primary" | "outline" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    icon?: ReactNode;
    loading?: boolean;
}

export const Button = ({ variant = "primary", icon, loading = false, children, className, disabled, ...rest }: Props) => (
    <button
        type="button"
        className={`${styles.button} ${styles[variant]} ${className ?? ""}`}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
    >
        {loading ? <span className={styles.spinner} aria-hidden /> : icon}
        {children}
    </button>
);
