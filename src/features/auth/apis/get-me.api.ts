import { bitacoraApi } from "../../../api/bitacora.api";
import { CurrentUser } from "../interfaces/me.response";

export const getMeApi = async (): Promise<CurrentUser> => {
    const response = await bitacoraApi.get<CurrentUser>("/api/v1/auth/me");
    // Same guard as get-products.api.ts: a missing base URL returns index.html with a 200.
    if (!Array.isArray(response.data?.permissions)) {
        throw new Error("Respuesta inesperada del servicio de autenticación. Revisa VITE_BITACORA_BASE_URL.");
    }
    return response.data;
};
