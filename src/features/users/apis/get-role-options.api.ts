import { bitacoraApi } from "../../../api/bitacora.api";
import { RoleOption } from "../interfaces/user.interface";

interface RoleResponse extends RoleOption {
    [extra: string]: unknown;
}

// GET /api/v1/roles (needs roles:view) for the role selects. The Roles feature owns the full RoleDto;
// this screen only needs id, key, name and isActive.
export const getRoleOptionsApi = async (): Promise<RoleOption[]> => {
    const response = await bitacoraApi.get<RoleResponse[]>("/api/v1/roles");
    if (!Array.isArray(response.data)) throw new Error("Respuesta inesperada del servicio de roles.");
    return response.data.map(({ id, key, name, isActive }) => ({ id, key, name, isActive }));
};
