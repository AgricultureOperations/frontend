import { bitacoraApi } from "../../../api/bitacora.api";
import { PermissionMatrix } from "../interfaces/permission.interface";

export const getPermissionMatrixApi = async (): Promise<PermissionMatrix> => {
    const response = await bitacoraApi.get<PermissionMatrix>("/api/v1/permissions");
    if (!Array.isArray(response.data?.actions) || !Array.isArray(response.data?.resources)) {
        throw new Error("Respuesta inesperada del servicio de permisos. Revisa VITE_BITACORA_BASE_URL.");
    }
    return response.data;
};
