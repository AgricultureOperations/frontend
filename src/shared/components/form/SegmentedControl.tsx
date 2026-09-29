import styles from "../../../styles/shared/components/form/Form.module.scss";

interface Props<T extends string> {
    label: string;
    required?: boolean;
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
    hint?: string;
    fullWidth?: boolean;
}

// Radio group styled as the reference's pill toggle ("Posgrado | Grado").
export const SegmentedControl = <T extends string>({ label, required = false, value, options, onChange, hint, fullWidth = false }: Props<T>) => (
    <div className={`${styles.field} ${fullWidth ? styles.fullWidth : ""}`}>
        <div className={styles.labelRow} aria-hidden>
            <span className={styles.label}>{label}</span>
            {required && <span className={styles.required}>*</span>}
        </div>
        <div className={styles.segmented} role="radiogroup" aria-label={label} aria-required={required || undefined}>
            {options.map((option) => {
                const checked = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        className={`${styles.segment} ${checked ? styles.segmentActive : ""}`}
                        onClick={() => onChange(option.value)}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
        {hint && <span className={styles.hint}>{hint}</span>}
    </div>
);
