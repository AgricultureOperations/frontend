import { bitacoraApi } from "../../../api/bitacora.api";
import { UserListQuery, UserListResponse } from "../interfaces/user-list.interface";

// Same guard as get-products.api.ts: a missing VITE_BITACORA_BASE_URL gets index.html with a 200.
const isUserListResponse = (body: unknown): body is UserListResponse => {
    const candidate = body as Partial<UserListResponse> | null;
    return Array.isArray(candidate?.data) && typeof candidate?.meta?.total === "number";
};

export const getUsersApi = async (query: UserListQuery): Promise<UserListResponse> => {
    const response = await bitacoraApi.get<UserListResponse>("/api/v1/user", { params: query });
    if (!isUserListResponse(response.data)) {
        throw new Error("Respuesta inesperada del servicio de usuarios. Revisa VITE_BITACORA_BASE_URL.");
    }
    return response.data;
};
