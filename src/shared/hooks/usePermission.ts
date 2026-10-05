import { useCallback } from "react";
import { fetchMeThunk } from "../../features/auth/states/auth.slice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { hasPermission, PermissionAction, toPermissionCode } from "../utils/permissions";

// Reads the permissions from GET /auth/me (never from the JWT). `ready` is false until /auth/me answers,
// so callers can tell "still loading" from "not allowed".
export const usePermission = () => {
    const dispatch = useAppDispatch();
    const me = useAppSelector((state) => state.auth.me);
    const status = useAppSelector((state) => state.auth.meStatus);
    const permissions = me?.permissions;

    const can = useCallback(
        (resource: string, action: PermissionAction) => hasPermission(permissions, toPermissionCode(resource, action)),
        [permissions],
    );
    const canCode = useCallback((code: string) => hasPermission(permissions, code), [permissions]);

    // Re-reads /auth/me, e.g. after the signed-in user's own role changed. A stale token answers 401,
    // and the axios interceptor sends the user back to /login.
    const refresh = useCallback(() => {
        dispatch(fetchMeThunk());
    }, [dispatch]);

    return { can, canCode, me, status, ready: status === "ready", refresh };
};
