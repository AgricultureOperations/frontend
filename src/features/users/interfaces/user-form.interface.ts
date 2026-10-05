export interface UserFormValues {
    name: string;
    email: string;
    password: string;
    roleId: string;
}

export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;
