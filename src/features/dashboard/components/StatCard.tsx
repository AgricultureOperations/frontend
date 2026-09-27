import styles from "../../../styles/features/dashboard/components/StatCard.module.scss";

interface Props {
    label: string;
    value: number;
}

export const StatCard = ({ label, value }: Props) => {
    return (
        <div className={styles.card}>
            <span className={styles.value}>{value}</span>
            <span className={styles.label}>{label}</span>
        </div>
    );
};
