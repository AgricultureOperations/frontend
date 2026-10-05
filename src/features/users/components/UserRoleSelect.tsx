import { FiShield } from "react-icons/fi";
import styles from "../../../styles/features/users/components/UsersTable.module.scss";
import { RoleOption, User } from "../interfaces/user.interface";
import { formatRoleLabel } from "../utils/user-filters";

interface Props {
    user: User;
    options: RoleOption[];
    // Omitted when the row is read-only (no users:edit, or the signed-in user's own row).
    onChange?: (user: User, roleId: string) => void;
    pending?: boolean;
}

// Reference: shield icon + an inline select showing "Name (key)". Changing it saves right away (optimistic, reverted on error).
export const UserRoleSelect = ({ user, options, onChange, pending = false }: Props) => {
    if (!onChange) {
        return (
            <span className={styles.roleCell}>
                <FiShield className={styles.roleIcon} aria-hidden />
                <span className={styles.roleText}>{formatRoleLabel(user.role)}</span>
            </span>
        );
    }

    // Keep the current role selectable even when it's inactive or missing from the fetched list.
    const choices = options.some((o) => o.id === user.role.id) ? options : [{ ...user.role, isActive: true }, ...options];

    return (
        <span className={styles.roleCell}>
            <FiShield className={styles.roleIcon} aria-hidden />
            <select
                className={styles.roleSelect}
                value={user.role.id}
                onChange={(event) => onChange(user, event.target.value)}
                disabled={pending}
                aria-label={`Rol de ${user.name}`}
            >
                {choices.map((role) => (
                    <option key={role.id} value={role.id} disabled={!role.isActive && role.id !== user.role.id}>
                        {formatRoleLabel(role)}
                    </option>
                ))}
            </select>
        </span>
    );
};
