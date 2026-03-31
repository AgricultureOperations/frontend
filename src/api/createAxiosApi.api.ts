import axios, { AxiosInstance } from "axios";
export const createAxiosApi = (baseURL: string): AxiosInstance => {
    const api = axios.create({baseURL});
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const status = error.response.status;
          const requestUrl = error.config?.url;
          // El servidor respondió con error
          if (status === 401 && requestUrl !== "/api/v1/auth/login") {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }
        } 
    
        return Promise.reject(error);
    });
  return api;
}
