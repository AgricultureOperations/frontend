import { bitacoraApi } from "../../../api/bitacora.api";
import { Role } from "../interfaces/role.interface";
import { UpdateRoleRequest } from "../interfaces/role.request";

// 409 when deactivating a system role or a role that still has users.
export const updateRoleApi = async (id: string, body: UpdateRoleRequest): Promise<Role> => {
    const response = await bitacoraApi.patch<Role>(`/api/v1/roles/${id}`, body);
    return response.data;
};
