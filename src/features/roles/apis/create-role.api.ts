import { bitacoraApi } from "../../../api/bitacora.api";
import { Role } from "../interfaces/role.interface";
import { CreateRoleRequest } from "../interfaces/role.request";

// 409 when the key or name is taken.
export const createRoleApi = async (body: CreateRoleRequest): Promise<Role> => {
    const response = await bitacoraApi.post<Role>("/api/v1/roles", body);
    return response.data;
};
