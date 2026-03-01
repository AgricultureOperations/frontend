import type  { UserListProps } from '../interfaces/user.interface';

export const UserList = ({users} : UserListProps) => (
        <ul>
        {users.map(user => (
            <li key={user.id}>
                <strong>{user.email}</strong>
            </li>
        ))}
    </ul>
)
