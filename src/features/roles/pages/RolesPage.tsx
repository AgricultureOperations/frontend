import { FiAlertTriangle, FiShield, FiUserPlus } from "react-icons/fi";
import styles from "../../../styles/features/roles/pages/RolesPage.module.scss";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { PageLoader } from "../../../shared/components/PageLoader";
import { DeleteRoleDialog } from "../components/DeleteRoleDialog";
import { ManageRolesPanel } from "../components/ManageRolesPanel";
import { PermissionMatrixPanel } from "../components/PermissionMatrixPanel";
import { RoleEditModal } from "../components/RoleEditModal";
import { UnsavedChangesDialog } from "../components/UnsavedChangesDialog";
import { RolesTab, useRolesPage } from "../hooks/useRolesPage";

const TABS: { id: RolesTab; label: string; icon: JSX.Element }[] = [
    { id: "matrix", label: "Roles y permisos", icon: <FiShield aria-hidden /> },
    { id: "manage", label: "Administrar roles", icon: <FiUserPlus aria-hidden /> },
];

// Reference: Admisiones "Permisos del panel". Its third tab ("Árbol completo") is left out: AgriOps permissions
// are flat resource × action pairs, so the matrix already shows everything.
const RolesPage = () => {
    const p = useRolesPage();

    let content;
    if (p.error && p.roles.length === 0) {
        content = (
            <EmptyState
                icon={<FiAlertTriangle aria-hidden />}
                title="No se pudieron cargar los roles"
                subtitle={p.error}
                action={<Button variant="outline" onClick={p.reload}>Reintentar</Button>}
            />
        );
    } else if (p.firstLoad) {
        content = <PageLoader label="Cargando roles y permisos…" />;
    } else if (p.tab === "matrix") {
        content = <PermissionMatrixPanel roles={p.roles} m={p.matrix} saving={p.saving} />;
    } else {
        content = <ManageRolesPanel roles={p.roles} m={p.manage} saving={p.saving} />;
    }

    return (
        <div className={styles.page}>
            <div className={styles.titleGroup}>
                <h1 className={styles.title}>Roles &amp; Permissions</h1>
                <p className={styles.subtitle}>
                    Gestiona los roles y sus permisos. Los cambios cierran la sesión de los usuarios con ese rol.
                </p>
            </div>

            <div className={styles.tabs} role="tablist" aria-label="Secciones de roles">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        id={`roles-tab-${tab.id}`}
                        aria-selected={p.tab === tab.id}
                        aria-controls="roles-tabpanel"
                        className={`${styles.tab} ${p.tab === tab.id ? styles.tabActive : ""}`}
                        onClick={() => p.setTab(tab.id)}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.id === "matrix" && p.matrix.dirty && <span className={styles.dirtyDot} aria-label="cambios sin guardar" />}
                    </button>
                ))}
            </div>

            <div id="roles-tabpanel" role="tabpanel" aria-labelledby={`roles-tab-${p.tab}`}>
                {content}
            </div>

            {p.matrix.pendingRole && p.matrix.role && (
                <UnsavedChangesDialog roleName={p.matrix.role.name} onConfirm={p.matrix.confirmSwitch} onCancel={p.matrix.cancelSwitch} />
            )}
            {p.manage.editTarget && (
                <RoleEditModal
                    key={p.manage.editTarget.id}
                    role={p.manage.editTarget}
                    saving={p.saving}
                    onSave={p.manage.saveEdit}
                    onClose={p.manage.closeEdit}
                />
            )}
            {p.manage.deleteTarget && (
                <DeleteRoleDialog role={p.manage.deleteTarget} loading={p.saving} onConfirm={p.manage.confirmDelete} onCancel={p.manage.cancelDelete} />
            )}
        </div>
    );
};

export default RolesPage;
