import { bitacoraApi } from "../../../api/bitacora.api";
import { LoginResponse } from "../interfaces/login.response";

export const postLogin = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await bitacoraApi.post<LoginResponse>('/auth/login',
    {
        email,
        password
    })    
    return response.data;
}
