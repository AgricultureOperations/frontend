// auth-service rejects unknown fields (400), so each request carries exactly these keys.

// POST /api/v1/user
export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    roleId: string;
}

// PATCH /api/v1/user/:id (the email can't be changed)
export interface UpdateUserRequest {
    name: string;
}
