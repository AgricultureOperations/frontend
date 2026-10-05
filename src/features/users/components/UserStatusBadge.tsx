import styles from "../../../styles/features/users/components/UsersTable.module.scss";

// Reference: green "● Activo" pill; inactive users get a neutral one.
export const UserStatusBadge = ({ isActive }: { isActive: boolean }) => (
    <span className={`${styles.badge} ${isActive ? styles.badgeActive : styles.badgeInactive}`}>
        <span className={styles.dot} aria-hidden />
        {isActive ? "Activo" : "Inactivo"}
    </span>
);
