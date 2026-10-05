import type { ReactNode } from "react";
import { usePermission } from "../hooks/usePermission";

interface Props {
    // "<resource>:<action>", e.g. "users:edit"
    permission: string;
    children: ReactNode;
    fallback?: ReactNode;
}

// Renders children only when the signed-in user has the permission. Hiding is UX; the backend still answers 403.
export const Can = ({ permission, children, fallback = null }: Props) => {
    const { canCode } = usePermission();
    return <>{canCode(permission) ? children : fallback}</>;
};
