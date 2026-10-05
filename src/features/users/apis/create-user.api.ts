import { bitacoraApi } from "../../../api/bitacora.api";
import { User } from "../interfaces/user.interface";
import { CreateUserRequest } from "../interfaces/user.request";

export const createUserApi = async (body: CreateUserRequest): Promise<User> => {
    const response = await bitacoraApi.post<User>("/api/v1/user", body);
    return response.data;
};
