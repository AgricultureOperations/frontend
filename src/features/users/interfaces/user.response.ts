import { User } from "./user.interface";

export interface UsersApiResponse {
  success: boolean;
  message: string;
  data: User[];
}