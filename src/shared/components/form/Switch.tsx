import styles from "../../../styles/shared/components/form/Form.module.scss";

interface Props {
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const Switch = ({ id, label, description, checked, onChange }: Props) => (
    <label htmlFor={id} className={styles.switchRow}>
        <span className={styles.switchText}>
            <span className={styles.switchLabel}>{label}</span>
            {description && <span className={styles.hint}>{description}</span>}
        </span>
        <input
            id={id}
            name={id}
            type="checkbox"
            role="switch"
            className={styles.switchInput}
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
        />
        <span className={styles.switchTrack} aria-hidden><span className={styles.switchThumb} /></span>
    </label>
);
