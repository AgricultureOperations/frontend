// Mirrors auth-service PermissionMatrixDto (GET /api/v1/permissions): rows = resources, columns = actions.
export interface MatrixAction {
    id: string;
    key: string;
    name: string;
}

export interface MatrixPermission {
    id: string;
    // "<resource>:<action>", e.g. "products:edit"
    code: string;
    actionId: string;
    actionKey: string;
}

export interface MatrixResource {
    id: string;
    key: string;
    name: string;
    description: string | null;
    sortOrder: number;
    permissions: MatrixPermission[];
}

export interface PermissionMatrix {
    actions: MatrixAction[];
    resources: MatrixResource[];
}
