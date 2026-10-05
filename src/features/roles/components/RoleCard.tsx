import { FiEdit2, FiTrash2, FiUsers } from "react-icons/fi";
import styles from "../../../styles/features/roles/components/ManageRolesPanel.module.scss";
import { Role } from "../interfaces/role.interface";
import { deleteBlockedReason } from "../utils/role-key";

interface Props {
    role: Role;
    onEdit?: (role: Role) => void;
    onDelete?: (role: Role) => void;
}

// Reference: "Roles existentes" card (name + mono key), plus description, user count and badges.
export const RoleCard = ({ role, onEdit, onDelete }: Props) => {
    const blocked = deleteBlockedReason(role);
    return (
        <article className={`${styles.roleCard} ${role.isActive ? "" : styles.roleCardInactive}`} aria-label={role.name}>
            <div className={styles.roleCardTop}>
                <div className={styles.roleHeading}>
                    <span className={styles.roleName}>{role.name}</span>
                    <code className={styles.roleKey}>{role.key}</code>
                </div>
                <div className={styles.roleActions}>
                    {onEdit && (
                        <button type="button" className={styles.iconButton} onClick={() => onEdit(role)} aria-label={`Editar rol ${role.name}`} title="Editar">
                            <FiEdit2 aria-hidden />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            className={`${styles.iconButton} ${styles.danger}`}
                            onClick={() => onDelete(role)}
                            disabled={!!blocked}
                            aria-label={`Eliminar rol ${role.name}`}
                            title={blocked ?? "Eliminar"}
                        >
                            <FiTrash2 aria-hidden />
                        </button>
                    )}
                </div>
            </div>
            {role.description && <p className={styles.roleDescription}>{role.description}</p>}
            <div className={styles.roleMeta}>
                <span className={styles.userCount}>
                    <FiUsers aria-hidden /> {role.userCount} {role.userCount === 1 ? "usuario" : "usuarios"}
                </span>
                {role.isSystem && <span className={styles.systemBadge}>Sistema</span>}
                {!role.isActive && <span className={styles.inactiveBadge}>Inactivo</span>}
            </div>
        </article>
    );
};
