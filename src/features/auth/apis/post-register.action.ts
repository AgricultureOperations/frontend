import { bitacoraApi } from "../../../api/bitacora.api"
import { RegisterResponse } from "../interfaces/register.response"

export const postRegister = async (email: string, password: string): Promise<RegisterResponse> => {
    const register = await bitacoraApi.post('/api/v1/auth/register',
    {
        email,
        password
    })
    return register.data
}