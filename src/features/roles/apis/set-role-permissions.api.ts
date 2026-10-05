import { bitacoraApi } from "../../../api/bitacora.api";
import { Role } from "../interfaces/role.interface";

// Replaces the role's whole permission set. 409 if it would reduce admin's permissions.
// On a change auth-service invalidates the tokens of every user with this role.
export const setRolePermissionsApi = async (id: string, permissionIds: string[]): Promise<Role> => {
    const response = await bitacoraApi.put<Role>(`/api/v1/roles/${id}/permissions`, { permissionIds });
    return response.data;
};
