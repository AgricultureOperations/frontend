// GET /api/v1/auth/me (auth-service AuthService.me): the signed-in user plus the role's permission codes.
export interface CurrentUser {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    role: { id: string; key: string; name: string };
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
    // "<resource>:<action>", e.g. "users:edit"
    permissions: string[];
}
