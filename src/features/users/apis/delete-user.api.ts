import { bitacoraApi } from "../../../api/bitacora.api";

// 204; 409 when it would delete the last active admin.
export const deleteUserApi = async (id: string): Promise<void> => {
    await bitacoraApi.delete(`/api/v1/user/${id}`);
};
