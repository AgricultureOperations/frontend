import styles from "../../styles/shared/components/PageLoader.module.scss";

// Card-sized "loading" row, used while a page's first data (or /auth/me) is on its way.
export const PageLoader = ({ label }: { label: string }) => (
    <div className={styles.loading} role="status">
        <span className={styles.spinner} aria-hidden />
        {label}
    </div>
);
