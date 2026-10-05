import { MatrixAction, MatrixPermission, MatrixResource, PermissionMatrix } from "../interfaces/permission.interface";

// Pure selection logic for the role × permission matrix. The hook keeps the draft as a Set of permission ids.

export type RowState = "all" | "some" | "none";

// Column headers in Spanish; unknown actions fall back to the backend's name.
const ACTION_LABELS: Record<string, string> = { view: "Ver", create: "Crear", edit: "Editar", delete: "Eliminar" };
export const actionLabel = (action: Pick<MatrixAction, "key" | "name">) => ACTION_LABELS[action.key] ?? action.name;

export const sortResources = (resources: MatrixResource[]) => [...resources].sort((a, b) => a.sortOrder - b.sortOrder);

export const allPermissionIds = (matrix: PermissionMatrix): string[] =>
    matrix.resources.flatMap((resource) => resource.permissions.map((p) => p.id));

export const findCell = (resource: MatrixResource, actionId: string): MatrixPermission | undefined =>
    resource.permissions.find((p) => p.actionId === actionId);

export const getRowState = (resource: MatrixResource, selected: ReadonlySet<string>): RowState => {
    const count = resource.permissions.filter((p) => selected.has(p.id)).length;
    if (count === 0) return "none";
    return count === resource.permissions.length ? "all" : "some";
};

export const toggleCell = (selected: ReadonlySet<string>, permissionId: string): Set<string> => {
    const next = new Set(selected);
    if (next.has(permissionId)) next.delete(permissionId);
    else next.add(permissionId);
    return next;
};

// A full row clears; an empty or partial row selects every action (like the reference's folder checkbox).
export const toggleRow = (selected: ReadonlySet<string>, resource: MatrixResource): Set<string> => {
    const next = new Set(selected);
    const selectAll = getRowState(resource, selected) !== "all";
    resource.permissions.forEach((p) => (selectAll ? next.add(p.id) : next.delete(p.id)));
    return next;
};

// "Marcar todos" / "Desmarcar todos" act on the rows that are visible (the search filter), not on hidden ones.
export const setRows = (selected: ReadonlySet<string>, resources: MatrixResource[], checked: boolean): Set<string> => {
    const next = new Set(selected);
    resources.forEach((resource) => resource.permissions.forEach((p) => (checked ? next.add(p.id) : next.delete(p.id))));
    return next;
};

export const isDirty = (selected: ReadonlySet<string>, saved: readonly string[]): boolean =>
    selected.size !== saved.length || saved.some((id) => !selected.has(id));

// Matches the resource's name, key or description, or any of its permission codes ("products:edit").
export const filterResources = (resources: MatrixResource[], query: string): MatrixResource[] => {
    const q = query.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter(
        (r) =>
            r.name.toLowerCase().includes(q) ||
            r.key.toLowerCase().includes(q) ||
            (r.description ?? "").toLowerCase().includes(q) ||
            r.permissions.some((p) => p.code.toLowerCase().includes(q)),
    );
};
