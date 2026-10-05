import { bitacoraApi } from "../../../api/bitacora.api";
import { User } from "../interfaces/user.interface";

// 409 when it would deactivate the last active admin.
export const updateUserStatusApi = async (id: string, isActive: boolean): Promise<User> => {
    const response = await bitacoraApi.patch<User>(`/api/v1/user/${id}/status`, { isActive });
    return response.data;
};
