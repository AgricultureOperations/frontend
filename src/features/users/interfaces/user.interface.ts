export interface UserListProps {
  users: User[]
}

export interface User {
    id:       string;
    email:    string;
    password: string;
}