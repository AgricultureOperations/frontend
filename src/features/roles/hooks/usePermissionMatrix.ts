import { useEffect, useMemo, useState } from "react";
import { usePermission } from "../../../shared/hooks/usePermission";
import { showToast } from "../../../shared/states/toast.slice";
import { useAppDispatch } from "../../../store/hooks";
import { MatrixResource, PermissionMatrix } from "../interfaces/permission.interface";
import { Role } from "../interfaces/role.interface";
import { setRolePermissionsThunk } from "../states/role.slice";
import {
    allPermissionIds,
    filterResources,
    isDirty,
    setRows,
    sortResources,
    toggleCell,
    toggleRow,
} from "../utils/permission-matrix";
import { ADMIN_ROLE_KEY } from "../utils/role-key";

// Draft state of the "Roles y permisos" tab. The draft is keyed by role, so switching roles or tabs never
// leaks unsaved checks into another role; it's dropped after a save or an explicit discard.
export const usePermissionMatrix = (roles: Role[], matrix: PermissionMatrix | null) => {
    const dispatch = useAppDispatch();
    const { can, me, refresh } = usePermission();
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [draft, setDraft] = useState<{ roleId: string; ids: Set<string> } | null>(null);
    const [pendingRoleId, setPendingRoleId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // Until one is picked, open an editable role rather than the locked admin.
    const role = roles.find((r) => r.id === selectedRoleId) ?? roles.find((r) => r.key !== ADMIN_ROLE_KEY) ?? roles[0] ?? null;
    const isAdminRole = role?.key === ADMIN_ROLE_KEY;
    const canEdit = can("roles", "edit") && !isAdminRole;

    const allIds = useMemo(() => (matrix ? allPermissionIds(matrix) : []), [matrix]);
    const resources = useMemo(() => (matrix ? sortResources(matrix.resources) : []), [matrix]);
    const visibleResources = useMemo(() => filterResources(resources, search), [resources, search]);

    // admin always holds every permission (the backend refuses to reduce it), so it's shown fully checked.
    const selected: ReadonlySet<string> = useMemo(() => {
        if (!role) return new Set();
        if (isAdminRole) return new Set(allIds);
        return draft?.roleId === role.id ? draft.ids : new Set(role.permissionIds);
    }, [role, isAdminRole, allIds, draft]);

    const dirty = !!role && !isAdminRole && isDirty(selected, role.permissionIds);

    // Closing or reloading the tab with unsaved checks asks first.
    useEffect(() => {
        if (!dirty) return;
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [dirty]);

    const update = (next: Set<string>) => {
        if (role && canEdit) setDraft({ roleId: role.id, ids: next });
    };

    const selectRole = (roleId: string) => {
        if (roleId === role?.id) return;
        if (dirty) setPendingRoleId(roleId);
        else setSelectedRoleId(roleId);
    };

    const save = async () => {
        if (!role || !dirty) return;
        const action = await dispatch(setRolePermissionsThunk({ id: role.id, permissionIds: [...selected] }));
        if (setRolePermissionsThunk.rejected.match(action)) {
            dispatch(showToast("error", action.payload ?? "No se pudieron guardar los permisos"));
            return;
        }
        setDraft(null);
        dispatch(showToast("success", `Permisos de ${role.name} guardados`));
        // auth-service invalidated the tokens of this role's users; if that includes us, re-login now.
        if (me?.role.id === role.id) refresh();
    };

    return {
        role,
        isAdminRole,
        canEdit,
        resources: visibleResources,
        hasResources: resources.length > 0,
        actions: matrix?.actions ?? [],
        selected,
        selectedCount: selected.size,
        totalCount: allIds.length,
        dirty,
        search,
        setSearch,
        selectRole,
        toggleCell: (permissionId: string) => update(toggleCell(selected, permissionId)),
        toggleRow: (resource: MatrixResource) => update(toggleRow(selected, resource)),
        selectAll: () => update(setRows(selected, visibleResources, true)),
        clearAll: () => update(setRows(selected, visibleResources, false)),
        discard: () => setDraft(null),
        save,
        // unsaved-changes dialog when switching roles
        pendingRole: roles.find((r) => r.id === pendingRoleId) ?? null,
        confirmSwitch: () => {
            setDraft(null);
            setSelectedRoleId(pendingRoleId);
            setPendingRoleId(null);
        },
        cancelSwitch: () => setPendingRoleId(null),
    };
};
