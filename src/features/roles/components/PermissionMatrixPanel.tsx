import { useEffect, useId, useRef } from "react";
import { FiAlertTriangle, FiLock, FiSave, FiSearch, FiShield } from "react-icons/fi";
import styles from "../../../styles/features/roles/components/PermissionMatrixPanel.module.scss";
import { Button } from "../../../shared/components/Button";
import { MatrixResource } from "../interfaces/permission.interface";
import { Role } from "../interfaces/role.interface";
import { actionLabel, findCell, getRowState, RowState } from "../utils/permission-matrix";
import { formatRoleOption } from "../utils/role-key";
import type { usePermissionMatrix } from "../hooks/usePermissionMatrix";

type Matrix = ReturnType<typeof usePermissionMatrix>;

interface Props {
    roles: Role[];
    m: Matrix;
    saving: boolean;
}

const ADMIN_LOCK_HINT = "El rol Administrador siempre tiene todos los permisos";

// Native checkboxes can only show "indeterminate" through the DOM property.
const RowCheckbox = ({ state, label, disabled, title, onChange }: { state: RowState; label: string; disabled: boolean; title?: string; onChange: () => void }) => {
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (ref.current) ref.current.indeterminate = state === "some";
    }, [state]);
    return (
        <input
            ref={ref}
            type="checkbox"
            className={styles.checkbox}
            checked={state === "all"}
            aria-checked={state === "some" ? "mixed" : state === "all"}
            aria-label={label}
            title={title}
            disabled={disabled}
            onChange={onChange}
        />
    );
};

// Reference: Admisiones "Permisos del panel" → "Roles y permisos". Its permission tree becomes a matrix here
// (rows = resources, columns = actions), since AgriOps permissions are flat resource × action pairs.
export const PermissionMatrixPanel = ({ roles, m, saving }: Props) => {
    const roleSelectId = useId();
    const searchId = useId();
    const locked = !m.canEdit;
    const lockTitle = m.isAdminRole ? ADMIN_LOCK_HINT : undefined;

    const renderRow = (resource: MatrixResource) => {
        const rowState = getRowState(resource, m.selected);
        return (
            <tr key={resource.id}>
                <th scope="row" className={styles.resourceCell}>
                    <div className={styles.resource}>
                        <RowCheckbox
                            state={rowState}
                            label={`Todos los permisos de ${resource.name}`}
                            disabled={locked}
                            title={lockTitle}
                            onChange={() => m.toggleRow(resource)}
                        />
                        <div className={styles.resourceText}>
                            <span className={styles.resourceName}>
                                {resource.name}
                                <code className={styles.code}>{resource.key}</code>
                            </span>
                            {resource.description && <span className={styles.resourceDescription}>{resource.description}</span>}
                        </div>
                    </div>
                </th>
                {m.actions.map((action) => {
                    const cell = findCell(resource, action.id);
                    return (
                        <td key={action.id} className={styles.cell}>
                            {cell ? (
                                <label className={styles.cellLabel} title={lockTitle ?? cell.code}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={m.selected.has(cell.id)}
                                        disabled={locked}
                                        aria-label={`${actionLabel(action)} ${resource.name}`}
                                        onChange={() => m.toggleCell(cell.id)}
                                    />
                                    <code className={styles.code}>{cell.code}</code>
                                </label>
                            ) : (
                                <span className={styles.none} aria-label="No aplica">—</span>
                            )}
                        </td>
                    );
                })}
            </tr>
        );
    };

    return (
        <section className={styles.card} aria-labelledby="matrix-title">
            <div className={styles.header}>
                <h2 id="matrix-title" className={styles.title}>
                    <FiShield aria-hidden className={styles.titleIcon} />
                    Roles y permisos
                </h2>
                <p className={styles.description}>
                    Selecciona un rol y marca los permisos que tendrá. Al marcar un recurso se seleccionan todas sus acciones.
                </p>
            </div>

            <div className={styles.controls}>
                <div className={styles.roleField}>
                    <label htmlFor={roleSelectId} className={styles.label}>Rol</label>
                    <select
                        id={roleSelectId}
                        className={styles.select}
                        value={m.role?.id ?? ""}
                        onChange={(event) => m.selectRole(event.target.value)}
                    >
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {formatRoleOption(role)}{role.isActive ? "" : " · inactivo"}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.bulk}>
                    <Button variant="outline" onClick={m.selectAll} disabled={locked}>Marcar todos</Button>
                    <Button variant="outline" onClick={m.clearAll} disabled={locked}>Desmarcar todos</Button>
                </div>
            </div>

            {m.isAdminRole && (
                <p className={styles.notice}>
                    <FiLock aria-hidden /> {ADMIN_LOCK_HINT}. Sus permisos no se pueden reducir.
                </p>
            )}

            <div className={styles.searchBox}>
                <label htmlFor={searchId} className={styles.srOnly}>Buscar permiso</label>
                <FiSearch className={styles.searchIcon} aria-hidden />
                <input
                    id={searchId}
                    type="search"
                    className={styles.searchInput}
                    placeholder="Buscar permiso por nombre o código…"
                    value={m.search}
                    onChange={(event) => m.setSearch(event.target.value)}
                />
            </div>

            {m.resources.length === 0 ? (
                <p className={styles.empty}>
                    {m.hasResources ? `Ningún permiso coincide con «${m.search.trim()}».` : "No hay permisos definidos."}
                </p>
            ) : (
                <div className={styles.scroll}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col">Recurso</th>
                                {m.actions.map((action) => (
                                    <th key={action.id} scope="col" className={styles.cell}>{actionLabel(action)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>{m.resources.map(renderRow)}</tbody>
                    </table>
                </div>
            )}

            {m.canEdit && (
                <p className={styles.warning}>
                    <FiAlertTriangle aria-hidden />
                    Al guardar se cierra la sesión de los usuarios con este rol; volverán a entrar con los nuevos permisos.
                </p>
            )}

            <div className={styles.footer}>
                <span className={styles.count} aria-live="polite">
                    {m.selectedCount} de {m.totalCount} permisos seleccionados
                    {m.dirty && <span className={styles.dirty}> · cambios sin guardar</span>}
                </span>
                {m.canEdit && (
                    <div className={styles.footerActions}>
                        {m.dirty && <Button variant="outline" onClick={m.discard} disabled={saving}>Descartar</Button>}
                        <Button icon={<FiSave aria-hidden />} onClick={m.save} disabled={!m.dirty} loading={saving}>
                            Guardar cambios
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};
