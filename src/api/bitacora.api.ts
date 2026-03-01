import axios from "axios";

export const bitacoraApi = axios.create({
    baseURL: import.meta.env.VITE_BITACORA_BASE_URL,
});

bitacoraApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

bitacoraApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con error
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } 

    return Promise.reject(error);
  }
);