import { createAxiosApi } from "./createAxiosApi.api";

export const orderApi = createAxiosApi(import.meta.env.VITE_ORDERSERVICE_BASE_URL);