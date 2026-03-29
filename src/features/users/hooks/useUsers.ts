import { useEffect, useState } from "react";
import { fetchUsers } from "../apis/fetch-users.action";
import { User } from "../interfaces/user.interface";

export const useUser = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await fetchUsers()
                // console.log(data)
                setUsers(data)
            } catch (error) {
                console.log(error)
                setError('Error en el servidor, intentelo más tarde')
            } finally{
                setLoading(false)
            }
        }

        loadUsers();
    }, []);

    return {
        //variable here 
        users, 
        loading, 
        error
    }
}