import { User } from "./user.interface";

// GET /api/v1/user query and response (auth-service UserListFilter / Paginated<UserDto>).
export interface UserListQuery {
    page: number;
    pageSize: number;
    search?: string;
    roleId?: string;
    isActive?: boolean;
}

export interface UserListMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface UserListResponse {
    data: User[];
    meta: UserListMeta;
}
