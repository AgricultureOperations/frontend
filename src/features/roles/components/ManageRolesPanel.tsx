import styles from "../../../styles/features/roles/components/ManageRolesPanel.module.scss";
import { Role } from "../interfaces/role.interface";
import type { useManageRoles } from "../hooks/useManageRoles";
import { RoleCard } from "./RoleCard";
import { RoleCreateForm } from "./RoleCreateForm";

interface Props {
    roles: Role[];
    m: ReturnType<typeof useManageRoles>;
    saving: boolean;
}

// Reference: Admisiones "Permisos del panel" → "Administrar roles" (inline create form + grid of role cards).
export const ManageRolesPanel = ({ roles, m, saving }: Props) => (
    <section className={styles.panel} aria-label="Administrar roles">
        {m.canCreate && <RoleCreateForm m={m} saving={saving} />}
        <div className={styles.existing}>
            <h3 className={styles.existingTitle}>Roles existentes</h3>
            <div className={styles.grid}>
                {roles.map((role) => (
                    <RoleCard
                        key={role.id}
                        role={role}
                        onEdit={m.canEdit ? m.openEdit : undefined}
                        onDelete={m.canDelete ? m.askDelete : undefined}
                    />
                ))}
            </div>
        </div>
    </section>
);
