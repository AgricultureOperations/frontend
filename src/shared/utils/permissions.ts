// Permission codes are "<resource>:<action>" (auth-service RBAC, see auth-service/docs/rbac-handoff.md).
export type PermissionAction = "view" | "create" | "edit" | "delete";
export type PermissionCode = `${string}:${PermissionAction}`;

export const toPermissionCode = (resource: string, action: PermissionAction): PermissionCode => `${resource}:${action}`;

// UX only: it hides controls the user can't use. The backend enforces every permission (403).
export const hasPermission = (permissions: readonly string[] | undefined, code: string): boolean =>
    !!permissions && permissions.includes(code);
