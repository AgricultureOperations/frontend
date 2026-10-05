import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchRolesPageThunk } from "../states/role.slice";
import { useManageRoles } from "./useManageRoles";
import { usePermissionMatrix } from "./usePermissionMatrix";

export type RolesTab = "matrix" | "manage";

// Page state for Roles & Permissions: loads roles + the permission matrix and owns both tabs' state,
// so switching tabs keeps the matrix draft.
export const useRolesPage = () => {
    const dispatch = useAppDispatch();
    const { roles, matrix, loading, saving, error } = useAppSelector((state) => state.roles);
    const [tab, setTab] = useState<RolesTab>("matrix");

    const load = useCallback(() => {
        dispatch(fetchRolesPageThunk());
    }, [dispatch]);

    useEffect(() => {
        load();
    }, [load]);

    return {
        roles,
        loading,
        saving,
        error,
        reload: load,
        firstLoad: loading && roles.length === 0,
        tab,
        setTab,
        matrix: usePermissionMatrix(roles, matrix),
        manage: useManageRoles(),
    };
};
