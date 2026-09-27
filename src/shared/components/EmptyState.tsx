import type { ReactNode } from "react";
import styles from "../../styles/shared/components/EmptyState.module.scss";

interface Props {
    icon: ReactNode;
    title: string;
    subtitle?: string;
}

export const EmptyState = ({ icon, title, subtitle }: Props) => {
    return (
        <div className={styles.emptyState}>
            <span className={styles.icon}>{icon}</span>
            <p className={styles.title}>{title}</p>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
    );
};
