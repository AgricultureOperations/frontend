import { createAxiosApi } from "./createAxiosApi.api";

export const bitacoraApi = createAxiosApi(import.meta.env.VITE_BITACORA_BASE_URL);
