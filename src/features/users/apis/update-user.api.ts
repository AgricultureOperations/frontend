import { bitacoraApi } from "../../../api/bitacora.api";
import { User } from "../interfaces/user.interface";
import { UpdateUserRequest } from "../interfaces/user.request";

export const updateUserApi = async (id: string, body: UpdateUserRequest): Promise<User> => {
    const response = await bitacoraApi.patch<User>(`/api/v1/user/${id}`, body);
    return response.data;
};
