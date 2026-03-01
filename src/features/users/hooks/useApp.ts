import { useEffect, useState } from "react";
import { useUser } from "./useUsers";
import { User } from "../interfaces/user.interface";

export const useApp = () => {
    const {users, loading, error} = useUser();
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    
    const handleSearch = (query: string) => {
        const queryString = query.toLowerCase();
        setFilteredUsers(
            users.filter((user: User) => 
                user.email.toLowerCase().includes(queryString)
            )
        )
    }

    useEffect(() => {
        setFilteredUsers(users);
    }, [users])
    

    return {
        filteredUsers,
        loading,
        error,
        handleSearch
    }
    
}
