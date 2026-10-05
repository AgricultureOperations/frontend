import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePermission } from "../../../shared/hooks/usePermission";
import { showToast } from "../../../shared/states/toast.slice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { UserFormValues } from "../interfaces/user-form.interface";
import { RoleOption, User } from "../interfaces/user.interface";
import {
    createUserThunk,
    deleteUserThunk,
    fetchRoleOptionsThunk,
    fetchUsersThunk,
    updateUserRoleThunk,
    updateUserStatusThunk,
    updateUserThunk,
    USERS_DEFAULT_PAGE_SIZE,
    USERS_PAGE_SIZES,
} from "../states/user.slice";
import { deriveRoleOptions, parseUserFilters, StatusFilter, toUserListQuery } from "../utils/user-filters";

export type UserFormTarget = { mode: "create" } | { mode: "edit"; user: User };

const SEARCH_DEBOUNCE_MS = 300;

// Page state for the Users maintainer. Filters and paging live in the URL (?q, status, role, page, size),
// so a reload or a shared link shows the same list. Form state stays in the drawer's own hook.
export const useUsersMaintainer = () => {
    const dispatch = useAppDispatch();
    const { users, meta, loading, saving, error, roleOptions: fetchedRoles, roleChangePending } = useAppSelector((state) => state.users);
    const { can, me } = usePermission();
    const canViewRoles = can("roles", "view");

    const [params, setParams] = useSearchParams();
    const filters = parseUserFilters(params);
    const { search, status, roleId, page, pageSize } = filters;
    const [searchInput, setSearchInput] = useState(search);

    const [formTarget, setFormTarget] = useState<UserFormTarget | null>(null);
    const [statusTarget, setStatusTarget] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

    // Writes the given keys into the URL; empty values and defaults are removed to keep links short.
    const updateParams = useCallback(
        (patch: Record<string, string | number | null>, replace = false) => {
            setParams(
                (current) => {
                    const next = new URLSearchParams(current);
                    Object.entries(patch).forEach(([key, value]) => {
                        const isDefault =
                            value === null ||
                            value === "" ||
                            (key === "page" && value === 1) ||
                            (key === "size" && value === USERS_DEFAULT_PAGE_SIZE) ||
                            (key === "status" && value === "all");
                        if (isDefault) next.delete(key);
                        else next.set(key, String(value));
                    });
                    return next;
                },
                { replace },
            );
        },
        [setParams],
    );

    const loadUsers = useCallback(() => {
        dispatch(fetchUsersThunk(toUserListQuery({ search, status, roleId, page, pageSize })));
    }, [dispatch, search, status, roleId, page, pageSize]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        if (canViewRoles) dispatch(fetchRoleOptionsThunk());
    }, [dispatch, canViewRoles]);

    // Debounced search → URL (page back to 1). Typing replaces the history entry instead of adding one per key.
    useEffect(() => {
        const trimmed = searchInput.trim();
        if (trimmed === search) return;
        const timer = setTimeout(() => updateParams({ q: trimmed, page: null }, true), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchInput, search, updateParams]);

    // Without roles:view the role list can't be fetched; fall back to the roles present on this page.
    const roleOptions: RoleOption[] = useMemo(
        () => (fetchedRoles.length > 0 ? fetchedRoles : deriveRoleOptions(users)),
        [fetchedRoles, users],
    );

    const goToPage = (next: number) => {
        if (next === page) loadUsers();
        else updateParams({ page: next });
    };

    const toast = (type: "success" | "error", message: string) => dispatch(showToast(type, message));

    const changeRole = async (user: User, nextRoleId: string) => {
        const role = roleOptions.find((r) => r.id === nextRoleId);
        if (!role || role.id === user.role.id) return;
        const action = await dispatch(
            updateUserRoleThunk({ id: user.id, role: { id: role.id, key: role.key, name: role.name }, previous: user.role }),
        );
        if (updateUserRoleThunk.rejected.match(action)) {
            toast("error", action.payload ?? "No se pudo cambiar el rol");
            return;
        }
        toast("success", `Rol de ${user.name} actualizado a ${role.name}`);
    };

    // Returns the server's message on failure so the drawer can show it; null on success.
    const saveUser = async (values: UserFormValues): Promise<string | null> => {
        if (!formTarget) return null;

        if (formTarget.mode === "create") {
            const action = await dispatch(createUserThunk(values));
            if (createUserThunk.rejected.match(action)) {
                const message = action.payload ?? "No se pudo crear el usuario";
                toast("error", message);
                return message;
            }
            toast("success", `Usuario ${action.payload.email} creado`);
            setFormTarget(null);
            goToPage(1);
            return null;
        }

        const { user } = formTarget;
        if (values.name !== user.name) {
            const action = await dispatch(updateUserThunk({ id: user.id, changes: { name: values.name } }));
            if (updateUserThunk.rejected.match(action)) {
                const message = action.payload ?? "No se pudo actualizar el usuario";
                toast("error", message);
                return message;
            }
        }
        if (values.roleId !== user.role.id) {
            const role = roleOptions.find((r) => r.id === values.roleId);
            if (role) {
                const action = await dispatch(
                    updateUserRoleThunk({ id: user.id, role: { id: role.id, key: role.key, name: role.name }, previous: user.role }),
                );
                if (updateUserRoleThunk.rejected.match(action)) {
                    const message = action.payload ?? "No se pudo cambiar el rol";
                    toast("error", message);
                    return message;
                }
            }
        }
        toast("success", "Usuario actualizado");
        setFormTarget(null);
        return null;
    };

    const confirmStatus = async () => {
        if (!statusTarget) return;
        const isActive = !statusTarget.isActive;
        const action = await dispatch(updateUserStatusThunk({ id: statusTarget.id, isActive }));
        if (updateUserStatusThunk.rejected.match(action)) {
            toast("error", action.payload ?? "No se pudo cambiar el estado");
            return;
        }
        toast("success", `${statusTarget.name} ${isActive ? "habilitado" : "inhabilitado"}`);
        setStatusTarget(null);
        // With a status filter the row no longer belongs on this list.
        if (status !== "all") loadUsers();
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const action = await dispatch(deleteUserThunk(deleteTarget.id));
        if (deleteUserThunk.rejected.match(action)) {
            toast("error", action.payload ?? "No se pudo eliminar el usuario");
            return;
        }
        toast("success", `Usuario ${deleteTarget.email} eliminado`);
        setDeleteTarget(null);
        // Step back when the last row of a later page was removed; otherwise refresh the totals.
        goToPage(users.length === 1 && page > 1 ? page - 1 : page);
    };

    const hasFilters = search !== "" || status !== "all" || roleId !== "";

    return {
        users,
        meta,
        loading,
        saving,
        error,
        reload: loadUsers,
        currentUserId: me?.id ?? null,
        roleOptions,
        roleChangePending,
        // filters
        searchInput,
        setSearchInput,
        status,
        setStatus: (next: StatusFilter) => updateParams({ status: next, page: null }),
        roleId,
        setRoleId: (next: string) => updateParams({ role: next, page: null }),
        hasFilters,
        clearFilters: () => {
            setSearchInput("");
            updateParams({ q: null, status: null, role: null, page: null });
        },
        // paging
        page,
        pageSize,
        pageSizeOptions: USERS_PAGE_SIZES,
        goToPage,
        setPageSize: (size: number) => updateParams({ size, page: null }),
        // permissions
        canCreate: can("users", "create"),
        canEdit: can("users", "edit"),
        canDelete: can("users", "delete"),
        // role, form, status and delete flows
        changeRole,
        formTarget,
        openCreate: () => setFormTarget({ mode: "create" }),
        openEdit: (user: User) => setFormTarget({ mode: "edit", user }),
        closeForm: () => setFormTarget(null),
        saveUser,
        statusTarget,
        askStatus: (user: User) => setStatusTarget(user),
        cancelStatus: () => setStatusTarget(null),
        confirmStatus,
        deleteTarget,
        askDelete: (user: User) => setDeleteTarget(user),
        cancelDelete: () => setDeleteTarget(null),
        confirmDelete,
    };
};
