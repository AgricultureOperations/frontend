import type { ReactNode } from "react";
import styles from "../../styles/shared/components/EmptyState.module.scss";

interface Props {
    icon: ReactNode;
    title: string;
    subtitle?: string;
    // Optional call to action below the text (e.g. "Nuevo Producto", "Reintentar").
    action?: ReactNode;
}

export const EmptyState = ({ icon, title, subtitle, action }: Props) => {
    return (
        <div className={styles.emptyState}>
            <span className={styles.icon}>{icon}</span>
            <p className={styles.title}>{title}</p>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {action && <div className={styles.action}>{action}</div>}
        </div>
    );
};
