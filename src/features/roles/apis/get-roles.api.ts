import { bitacoraApi } from "../../../api/bitacora.api";
import { Role } from "../interfaces/role.interface";

export const getRolesApi = async (): Promise<Role[]> => {
    const response = await bitacoraApi.get<Role[]>("/api/v1/roles");
    // A missing VITE_BITACORA_BASE_URL gets index.html with a 200 (see get-products.api.ts).
    if (!Array.isArray(response.data)) throw new Error("Respuesta inesperada del servicio de roles. Revisa VITE_BITACORA_BASE_URL.");
    return response.data;
};
