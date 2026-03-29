import { bitacoraApi } from "../../../api/bitacora.api"
import { User } from "../interfaces/user.interface"

export const fetchUsers = async (): Promise<User[]> => {
  const response = await bitacoraApi<User[]>('/user')

  return response.data;
}