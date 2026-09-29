import type { ReactNode } from "react";
import styles from "../../../styles/shared/components/form/Form.module.scss";

interface Props {
    title: string;
    description?: string;
    // Pill on the right of the heading (the reference's "Permiso habilitado").
    badge?: ReactNode;
    children: ReactNode;
}

export const FormSection = ({ title, description, badge, children }: Props) => (
    <section className={styles.section} aria-label={title}>
        <div className={styles.sectionHeader}>
            <div>
                <h3 className={styles.sectionTitle}>{title}</h3>
                {description && <p className={styles.sectionDescription}>{description}</p>}
            </div>
            {badge && <span className={styles.sectionBadge}>{badge}</span>}
        </div>
        <div className={styles.grid}>{children}</div>
    </section>
);
