import styles from "../../../styles/features/users/components/UsersTable.module.scss";
import { getInitials } from "../../../shared/utils/formatUserDisplay";

// auth-service stores no photo, so the reference's FOTO column becomes an initials avatar.
export const UserAvatar = ({ name }: { name: string }) => (
    <span className={styles.avatar} aria-hidden>{getInitials(name)}</span>
);
