// auth-service rejects unknown fields (400), so each request carries only these keys.

// POST /api/v1/roles. Without `key` the backend derives it from the name.
export interface CreateRoleRequest {
    name: string;
    key?: string;
    description?: string;
}

// PATCH /api/v1/roles/:id
export interface UpdateRoleRequest {
    name?: string;
    description?: string;
    isActive?: boolean;
}
