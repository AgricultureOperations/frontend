// Mirrors auth-service UserDto (src/models/user.model.ts). There is no password field on the wire.
export interface UserRoleRef {
    id: string;
    key: string;
    name: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    role: UserRoleRef;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
}

// A role the user can be assigned (from GET /api/v1/roles, trimmed to what the Users screen needs).
export interface RoleOption extends UserRoleRef {
    isActive: boolean;
}
