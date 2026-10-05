import { bitacoraApi } from "../../../api/bitacora.api";
import { User } from "../interfaces/user.interface";

// 409 when it would demote the last active admin.
export const updateUserRoleApi = async (id: string, roleId: string): Promise<User> => {
    const response = await bitacoraApi.patch<User>(`/api/v1/user/${id}/role`, { roleId });
    return response.data;
};
