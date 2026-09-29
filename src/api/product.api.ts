import { createAxiosApi } from "./createAxiosApi.api";

export const productApi = createAxiosApi(import.meta.env.VITE_PRODUCTSERVICE_BASE_URL);
