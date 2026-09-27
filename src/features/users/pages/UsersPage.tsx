import { UserList } from '../components/UserList';
import { SearchBar } from '../../../shared/components/SearchBar';
import { useApp } from '../hooks/useApp';

function UsersPage() {
  const placeholder: string = 'Buscar correo'
  const {filteredUsers,/*loading,error,*/handleSearch} = useApp();
  /*if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>*/

  return (
    <>
      <h1>Users</h1>

      {/* search bar */}
      <SearchBar placeholder={placeholder} onQuery={handleSearch} />

      <UserList users={filteredUsers} />
    </>
    );
}

export default UsersPage;
