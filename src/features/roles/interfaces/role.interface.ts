// Mirrors auth-service RoleDto (src/models/role.model.ts).
export interface Role {
    id: string;
    // snake_case identifier, e.g. "operator"; can't change after creation
    key: string;
    name: string;
    description: string | null;
    // seeded roles (admin, operator, viewer): can't be deleted or deactivated
    isSystem: boolean;
    isActive: boolean;
    userCount: number;
    permissionIds: string[];
    createdAt: string;
    updatedAt: string;
}
