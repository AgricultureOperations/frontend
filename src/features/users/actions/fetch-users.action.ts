import { bitacoraApi } from "../../../api/bitacora.api"
import { User } from "../interfaces/user.interface"
import { UsersApiResponse } from "../interfaces/user.response"

export const fetchUsers = async (): Promise<User[]> => {
  const response = await bitacoraApi<UsersApiResponse>('/user',{
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUxMGRmNWE5LWQ0ODAtNDRkYy05ZWFmLTYwMDc3Mjc3N2NlYSIsImVtYWlsIjoiZWR3YXJkLmNydXpjcnV6MjcwNDE5OTZAZ21haWwuY29tIiwiaWF0IjoxNzcxOTA3NTg4LCJleHAiOjE3NzE5MTExODh9.lRGRD9fe8JtXvSconZ2cMhK1SwwwS4XEaCYudw9aQEs'
      }
    })

  return response.data.data;
}