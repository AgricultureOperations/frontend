import { bitacoraApi } from "../../../api/bitacora.api";

// 204; 409 for a system role or one that still has users.
export const deleteRoleApi = async (id: string): Promise<void> => {
    await bitacoraApi.delete(`/api/v1/roles/${id}`);
};
